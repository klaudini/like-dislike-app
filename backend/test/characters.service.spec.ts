import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { CharactersService } from "../src/characters/services/characters.service";
import { ExternalApisService } from "../src/characters/services/external-apis.service";
import { Character } from "../src/characters/entities/character.entity";

describe("CharactersService", () => {
  let service: CharactersService;
  let mockCharacterModel: any;
  let mockExternalApisService: any;

  const mockCharacter = {
    externalId: "pokemon-25",
    name: "Pikachu",
    image: "https://...",
    category: "pokemon",
    likes: 5,
    dislikes: 2,
    lastEvaluated: new Date(),
    metadata: { types: ["electric"] },
    save: jest.fn().mockResolvedValue(this),
  };

  beforeEach(async () => {
    // Mock del modelo de Mongoose
    mockCharacterModel = {
      findOne: jest.fn(),
      find: jest.fn(),
      countDocuments: jest.fn(),
      aggregate: jest.fn(),
      create: jest.fn(),
      exec: jest.fn(),
    };

    // Mock del servicio de APIs externas
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

  it("should be defined", () => {
    expect(service).toBeDefined();
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

      mockCharacterModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      mockCharacterModel.create.mockResolvedValue({
        ...voteDto,
        likes: 1,
        dislikes: 0,
        lastEvaluated: new Date(),
      });

      const result = await service.vote(voteDto);

      expect(mockCharacterModel.findOne).toHaveBeenCalledWith({
        externalId: voteDto.externalId,
      });
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
        ...mockCharacter,
        likes: 5,
        save: jest.fn().mockResolvedValue({
          ...mockCharacter,
          likes: 6,
        }),
      };

      mockCharacterModel.findOne.mockResolvedValue(existingCharacter);

      await service.vote(voteDto);

      expect(existingCharacter.likes).toBe(6);
      expect(existingCharacter.save).toHaveBeenCalled();
    });
  });

  describe("getPikachuStatus", () => {
    it("should return exists: false when Pikachu has not been evaluated", async () => {
      mockCharacterModel.findOne.mockResolvedValue(null);

      const result = await service.getPikachuStatus();

      expect(result.exists).toBe(false);
      expect(result.message).toContain("aún no ha sido evaluado");
    });

    it("should return Pikachu data when it exists", async () => {
      mockCharacterModel.findOne.mockResolvedValue(mockCharacter);

      const result = await service.getPikachuStatus();

      expect(result.exists).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.name).toBe("Pikachu");
    });
  });
});
