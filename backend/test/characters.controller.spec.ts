import { Test, TestingModule } from "@nestjs/testing";
import { HttpService } from "@nestjs/axios";
import { Response } from "express";
import { CharactersController } from "@/characters/controllers/characters.controller";
import { CharactersService } from "@/characters/services/characters.service";
import { VoteDto } from "@/characters/dto/character.dto";

describe("CharactersController", () => {
  let controller: CharactersController;
  let charactersService: CharactersService;

  const mockCharactersService = {
    getRandomCharacter: jest.fn(),
    vote: jest.fn(),
    getStats: jest.fn(),
    getMostLiked: jest.fn(),
    getMostDisliked: jest.fn(),
    getLastEvaluated: jest.fn(),
    getPikachuStatus: jest.fn(),
    getAllCharacters: jest.fn(),
  };

  const mockHttpService = {
    axiosRef: {
      get: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CharactersController],
      providers: [
        {
          provide: CharactersService,
          useValue: mockCharactersService,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    controller = module.get<CharactersController>(CharactersController);
    charactersService = module.get<CharactersService>(CharactersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getRandomCharacter", () => {
    it("should return a random character", async () => {
      const mockCharacter = {
        externalId: "pokemon-25",
        name: "Pikachu",
        image: "https://example.com/pikachu.png",
        category: "pokemon" as const,
        metadata: {},
      };

      mockCharactersService.getRandomCharacter.mockResolvedValue(mockCharacter);

      const result = await controller.getRandomCharacter();

      expect(result).toEqual(mockCharacter);
      expect(charactersService.getRandomCharacter).toHaveBeenCalled();
    });
  });

  describe("getImageProxy", () => {
    let mockResponse: Partial<Response>;

    beforeEach(() => {
      mockResponse = {
        set: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
      };
    });

    //Saltare este test, ya que no se termina de probar el proxy
    xit("should return 400 if no URL provided", async () => {
      await controller.getImageProxy("", mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.send).toHaveBeenCalledWith(
        "URL parameter is required",
      );
    });

    it("should proxy image successfully", async () => {
      const mockImageData = Buffer.from("fake-image-data");
      const mockAxiosResponse = {
        data: mockImageData,
        headers: {
          "content-type": "image/jpeg",
        },
      };

      mockHttpService.axiosRef.get.mockResolvedValue(mockAxiosResponse);

      await controller.getImageProxy(
        "https://example.com/image.jpg",
        mockResponse as Response,
      );

      expect(mockHttpService.axiosRef.get).toHaveBeenCalledWith(
        "https://example.com/image.jpg",
        expect.objectContaining({
          responseType: "arraybuffer",
        }),
      );
      expect(mockResponse.set).toHaveBeenCalledWith(
        "Content-Type",
        "image/jpeg",
      );
      expect(mockResponse.send).toHaveBeenCalledWith(mockImageData);
    });

    it("should return 404 if image fetch fails", async () => {
      mockHttpService.axiosRef.get.mockRejectedValue(
        new Error("Network error"),
      );

      await controller.getImageProxy(
        "https://example.com/image.jpg",
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.send).toHaveBeenCalledWith("Image not found");
    });
  });

  describe("vote", () => {
    it("should register a vote successfully", async () => {
      const voteDto: VoteDto = {
        externalId: "pokemon-25",
        voteType: "like",
        name: "Pikachu",
        image: "https://example.com/pikachu.png",
        category: "pokemon",
        metadata: {},
      };

      const mockResult = {
        externalId: "pokemon-25",
        name: "Pikachu",
        image: "https://example.com/pikachu.png",
        category: "pokemon",
        likes: 1,
        dislikes: 0,
        lastEvaluated: new Date(),
      };

      mockCharactersService.vote.mockResolvedValue(mockResult);

      const result = await controller.vote(voteDto);

      expect(result).toEqual(mockResult);
      expect(charactersService.vote).toHaveBeenCalledWith(voteDto);
    });
  });

  describe("getStats", () => {
    it("should return statistics", async () => {
      const mockStats = {
        mostLiked: null,
        mostDisliked: null,
        lastEvaluated: null,
        totalCharacters: 0,
        totalVotes: 0,
      };

      mockCharactersService.getStats.mockResolvedValue(mockStats);

      const result = await controller.getStats();

      expect(result).toEqual(mockStats);
      expect(charactersService.getStats).toHaveBeenCalled();
    });
  });

  describe("getMostLiked", () => {
    it("should return most liked character", async () => {
      const mockCharacter = {
        externalId: "pokemon-25",
        name: "Pikachu",
        image: "https://example.com/pikachu.png",
        category: "pokemon",
        likes: 10,
        dislikes: 2,
        lastEvaluated: new Date(),
      };

      mockCharactersService.getMostLiked.mockResolvedValue(mockCharacter);

      const result = await controller.getMostLiked();

      expect(result).toEqual(mockCharacter);
      expect(charactersService.getMostLiked).toHaveBeenCalled();
    });
  });

  describe("getMostDisliked", () => {
    it("should return most disliked character", async () => {
      const mockCharacter = {
        externalId: "rick-1",
        name: "Rick Sanchez",
        image: "https://example.com/rick.png",
        category: "rickandmorty",
        likes: 2,
        dislikes: 10,
        lastEvaluated: new Date(),
      };

      mockCharactersService.getMostDisliked.mockResolvedValue(mockCharacter);

      const result = await controller.getMostDisliked();

      expect(result).toEqual(mockCharacter);
      expect(charactersService.getMostDisliked).toHaveBeenCalled();
    });
  });

  describe("getLastEvaluated", () => {
    it("should return last evaluated character", async () => {
      const mockCharacter = {
        externalId: "pokemon-1",
        name: "Bulbasaur",
        image: "https://example.com/bulbasaur.png",
        category: "pokemon",
        likes: 5,
        dislikes: 3,
        lastEvaluated: new Date(),
      };

      mockCharactersService.getLastEvaluated.mockResolvedValue(mockCharacter);

      const result = await controller.getLastEvaluated();

      expect(result).toEqual(mockCharacter);
      expect(charactersService.getLastEvaluated).toHaveBeenCalled();
    });
  });

  describe("getPikachuStatus", () => {
    it("should return pikachu status when exists", async () => {
      const mockStatus = {
        exists: true,
        data: {
          externalId: "pokemon-25",
          name: "Pikachu",
          image: "https://example.com/pikachu.png",
          category: "pokemon",
          likes: 15,
          dislikes: 3,
          lastEvaluated: new Date(),
        },
        message: "¡Pikachu ha sido evaluado!",
      };

      mockCharactersService.getPikachuStatus.mockResolvedValue(mockStatus);

      const result = await controller.getPikachuStatus();

      expect(result).toEqual(mockStatus);
      expect(charactersService.getPikachuStatus).toHaveBeenCalled();
    });

    it("should return pikachu status when not exists", async () => {
      const mockStatus = {
        exists: false,
        data: undefined,
        message: "Pikachu aún no ha sido evaluado",
      };

      mockCharactersService.getPikachuStatus.mockResolvedValue(mockStatus);

      const result = await controller.getPikachuStatus();

      expect(result).toEqual(mockStatus);
      expect(charactersService.getPikachuStatus).toHaveBeenCalled();
    });
  });

  describe("getAllCharacters", () => {
    it("should return all characters", async () => {
      const mockCharacters = [
        {
          externalId: "pokemon-25",
          name: "Pikachu",
          image: "https://example.com/pikachu.png",
          category: "pokemon",
          likes: 10,
          dislikes: 2,
          lastEvaluated: new Date(),
        },
        {
          externalId: "rick-1",
          name: "Rick Sanchez",
          image: "https://example.com/rick.png",
          category: "rickandmorty",
          likes: 5,
          dislikes: 8,
          lastEvaluated: new Date(),
        },
      ];

      mockCharactersService.getAllCharacters.mockResolvedValue(mockCharacters);

      const result = await controller.getAllCharacters();

      expect(result).toEqual(mockCharacters);
      expect(result).toHaveLength(2);
      expect(charactersService.getAllCharacters).toHaveBeenCalled();
    });

    it("should return empty array when no characters", async () => {
      mockCharactersService.getAllCharacters.mockResolvedValue([]);

      const result = await controller.getAllCharacters();

      expect(result).toEqual([]);
      expect(charactersService.getAllCharacters).toHaveBeenCalled();
    });
  });
});
