import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { NotFoundException } from "@nestjs/common";
import { CharactersService } from "@/characters/services/characters.service";
import { ExternalApisService } from "@/characters/services/external-apis.service";
import { Character } from "@/characters/entities/character.entity";

describe("CharactersService", () => {
  let service: CharactersService;
  let mockCharacterModel: any;
  let mockExternalApisService: any;

  beforeEach(async () => {
    // Helper para crear query mocks con chaining
    const createQueryMock = (returnValue: any) => ({
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(returnValue),
    });

    mockCharacterModel = {
      findOne: jest.fn((query?: any) => createQueryMock(null)),
      find: jest.fn(() => ({
        sort: jest.fn().mockResolvedValue([]),
      })),
      countDocuments: jest.fn(() => ({
        exec: jest.fn().mockResolvedValue(0),
      })),
      aggregate: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
    };

    mockExternalApisService = {
      getRandomCharacter: jest.fn(),
      getPikachu: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CharactersService,
        {
          provide: getModelToken(Character.name),
          useValue: mockCharacterModel,
        },
        {
          provide: ExternalApisService,
          useValue: mockExternalApisService,
        },
      ],
    }).compile();

    service = module.get<CharactersService>(CharactersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getRandomCharacter", () => {
    it("should return a random character from external API", async () => {
      const mockResult = {
        externalId: "pokemon-25",
        name: "Pikachu",
        image: "https://...",
        category: "pokemon" as const,
        metadata: {},
      };

      mockExternalApisService.getRandomCharacter.mockResolvedValue(mockResult);

      const result = await service.getRandomCharacter();

      expect(result).toEqual(mockResult);
      expect(mockExternalApisService.getRandomCharacter).toHaveBeenCalled();
    });
  });

  describe("vote", () => {
    it("should create a new character with a like vote", async () => {
      const voteDto = {
        externalId: "pokemon-25",
        voteType: "like" as const,
        name: "Pikachu",
        image: "https://...",
        category: "pokemon" as const,
        metadata: { types: ["electric"] },
      };

      mockCharacterModel.findOne.mockResolvedValue(null);

      const createdCharacter = {
        ...voteDto,
        likes: 1,
        dislikes: 0,
        lastEvaluated: new Date(),
      };

      mockCharacterModel.create.mockResolvedValue(createdCharacter);

      const result = await service.vote(voteDto);

      expect(mockCharacterModel.findOne).toHaveBeenCalledWith({
        externalId: voteDto.externalId,
      });
      expect(mockCharacterModel.create).toHaveBeenCalled();
      expect(result.likes).toBe(1);
      expect(result.dislikes).toBe(0);
    });

    it("should increment likes for existing character", async () => {
      const voteDto = {
        externalId: "pokemon-25",
        voteType: "like" as const,
        name: "Pikachu",
        image: "https://...",
        category: "pokemon" as const,
        metadata: {},
      };

      const existingCharacter = {
        externalId: "pokemon-25",
        name: "Pikachu",
        likes: 5,
        dislikes: 2,
        save: jest.fn().mockResolvedValue({
          externalId: "pokemon-25",
          name: "Pikachu",
          likes: 6,
          dislikes: 2,
        }),
      };

      mockCharacterModel.findOne.mockResolvedValue(existingCharacter);

      const result = await service.vote(voteDto);

      expect(existingCharacter.likes).toBe(6);
      expect(existingCharacter.save).toHaveBeenCalled();
      expect(result.likes).toBe(6);
    });

    it("should increment dislikes for existing character", async () => {
      const voteDto = {
        externalId: "pokemon-25",
        voteType: "dislike" as const,
        name: "Pikachu",
        image: "https://...",
        category: "pokemon" as const,
        metadata: {},
      };

      const existingCharacter = {
        externalId: "pokemon-25",
        name: "Pikachu",
        likes: 5,
        dislikes: 2,
        save: jest.fn().mockResolvedValue({
          externalId: "pokemon-25",
          name: "Pikachu",
          likes: 5,
          dislikes: 3,
        }),
      };

      mockCharacterModel.findOne.mockResolvedValue(existingCharacter);

      const result = await service.vote(voteDto);

      expect(existingCharacter.dislikes).toBe(3);
      expect(existingCharacter.save).toHaveBeenCalled();
      expect(result.dislikes).toBe(3);
    });
  });

  describe("getStats", () => {
    it("should return empty stats when no characters exist", async () => {
      const createQueryMock = (returnValue: any) => ({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(returnValue),
      });

      mockCharacterModel.findOne.mockReturnValue(createQueryMock(null));
      mockCharacterModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });
      mockCharacterModel.aggregate.mockResolvedValue([{ totalVotes: 0 }]);

      const result = await service.getStats();

      expect(result.totalCharacters).toBe(0);
      expect(result.totalVotes).toBe(0);
      expect(result.mostLiked).toBeNull();
      expect(result.mostDisliked).toBeNull();
      expect(result.lastEvaluated).toBeNull();
    });

    it("should return complete stats when characters exist", async () => {
      const mostLikedChar = {
        externalId: "pokemon-25",
        name: "Pikachu",
        likes: 10,
        dislikes: 2,
      };
      const mostDislikedChar = {
        externalId: "rick-1",
        name: "Rick",
        likes: 2,
        dislikes: 8,
      };
      const lastEvaluatedChar = {
        externalId: "pokemon-1",
        name: "Bulbasaur",
        likes: 5,
        dislikes: 3,
      };

      const createMockQuery = (returnValue: any) => ({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(returnValue),
      });

      mockCharacterModel.findOne
        .mockReturnValueOnce(createMockQuery(mostLikedChar))
        .mockReturnValueOnce(createMockQuery(mostDislikedChar))
        .mockReturnValueOnce(createMockQuery(lastEvaluatedChar));

      mockCharacterModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(5),
      });
      mockCharacterModel.aggregate.mockResolvedValue([{ totalVotes: 25 }]);

      const result = await service.getStats();

      expect(result.totalCharacters).toBe(5);
      expect(result.totalVotes).toBe(25);
      expect(result.mostLiked).toBeDefined();
      expect(result.mostDisliked).toBeDefined();
      expect(result.lastEvaluated).toBeDefined();
    });
  });

  describe("getMostLiked", () => {
    it("should return the most liked character", async () => {
      const mostLiked = {
        externalId: "pokemon-25",
        name: "Pikachu",
        likes: 15,
        dislikes: 2,
      };

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mostLiked),
      };

      mockCharacterModel.findOne.mockReturnValue(mockQuery);

      const result = await service.getMostLiked();

      expect(result).toBeDefined();
      expect(result.likes).toBe(15);
      expect(mockQuery.sort).toHaveBeenCalledWith({ likes: -1 });
    });

    it("should throw NotFoundException when no characters exist", async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };

      mockCharacterModel.findOne.mockReturnValue(mockQuery);

      await expect(service.getMostLiked()).rejects.toThrow(NotFoundException);
    });
  });

  describe("getMostDisliked", () => {
    it("should return the most disliked character", async () => {
      const mostDisliked = {
        externalId: "rick-1",
        name: "Rick",
        likes: 2,
        dislikes: 20,
      };

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mostDisliked),
      };

      mockCharacterModel.findOne.mockReturnValue(mockQuery);

      const result = await service.getMostDisliked();

      expect(result).toBeDefined();
      expect(result.dislikes).toBe(20);
      expect(mockQuery.sort).toHaveBeenCalledWith({ dislikes: -1 });
    });

    it("should throw NotFoundException when no characters exist", async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };

      mockCharacterModel.findOne.mockReturnValue(mockQuery);

      await expect(service.getMostDisliked()).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("getLastEvaluated", () => {
    it("should return the last evaluated character", async () => {
      const lastChar = {
        externalId: "pokemon-1",
        name: "Bulbasaur",
        likes: 5,
        dislikes: 3,
        lastEvaluated: new Date(),
      };

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(lastChar),
      };

      mockCharacterModel.findOne.mockReturnValue(mockQuery);

      const result = await service.getLastEvaluated();

      expect(result).toBeDefined();
      expect(result.name).toBe("Bulbasaur");
      expect(mockQuery.sort).toHaveBeenCalledWith({ lastEvaluated: -1 });
    });

    it("should throw NotFoundException when no characters exist", async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };

      mockCharacterModel.findOne.mockReturnValue(mockQuery);

      await expect(service.getLastEvaluated()).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("getPikachuStatus", () => {
    it("should return exists: false when pikachu has not been evaluated", async () => {
      mockCharacterModel.findOne.mockResolvedValue(null);

      const result = await service.getPikachuStatus();

      expect(result.exists).toBe(false);
      expect(result.message).toContain("aún no ha sido evaluado");
    });

    it("should return pikachu data when it exists", async () => {
      const pikachuData = {
        externalId: "pokemon-25",
        name: "Pikachu",
        likes: 10,
        dislikes: 2,
        lastEvaluated: new Date(),
      };

      mockCharacterModel.findOne.mockResolvedValue(pikachuData);

      const result = await service.getPikachuStatus();

      expect(result.exists).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.name).toBe("Pikachu");
      expect(result.message).toContain("ha sido evaluado");
    });
  });

  describe("getAllCharacters", () => {
    it("should return all characters", async () => {
      const characters = [
        {
          externalId: "pokemon-25",
          name: "Pikachu",
          likes: 10,
          dislikes: 2,
        },
        {
          externalId: "pokemon-6",
          name: "Charizard",
          likes: 8,
          dislikes: 3,
        },
      ];

      mockCharacterModel.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(characters),
      });

      const result = await service.getAllCharacters();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("Pikachu");
      expect(result[1].name).toBe("Charizard");
    });

    it("should return empty array when no characters", async () => {
      mockCharacterModel.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      });

      const result = await service.getAllCharacters();

      expect(result).toEqual([]);
    });
  });
});
