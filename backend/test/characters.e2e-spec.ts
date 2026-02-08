import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { Connection } from "mongoose";
import { getConnectionToken } from "@nestjs/mongoose";

describe("Characters API (e2e)", () => {
  let app: INestApplication;
  let connection: Connection;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix("api");

    // aplica las mismas configuraciones que en main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    connection = moduleFixture.get<Connection>(getConnectionToken());
  });

  afterAll(async () => {
    // limpa la base de datos de test
    const collections = connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
    await app.close();
  });

  afterEach(async () => {
    // limpia despues de cada test
    const collections = connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  describe("/api/characters (GET)", () => {
    it("should return empty stats initially", () => {
      return request(app.getHttpServer())
        .get("/api/characters/stats")
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty("totalCharacters", 0);
          expect(res.body).toHaveProperty("totalVotes", 0);
          expect(res.body.mostLiked).toBeNull();
          expect(res.body.mostDisliked).toBeNull();
        });
    });
  });

  describe("/api/characters/random (GET)", () => {
    it("should return a random character from external API", () => {
      return request(app.getHttpServer())
        .get("/api/characters/random")
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty("externalId");
          expect(res.body).toHaveProperty("name");
          expect(res.body).toHaveProperty("image");
          expect(res.body).toHaveProperty("category");
          expect(["rickandmorty", "pokemon", "superhero"]).toContain(
            res.body.category,
          );
        });
    });
  });

  describe("/api/characters/vote (POST)", () => {
    it("should create a new character with like vote", async () => {
      const voteDto = {
        externalId: "test-pokemon-1",
        voteType: "like",
        name: "Test Pokemon",
        image: "https://example.com/image.png",
        category: "pokemon",
        metadata: { types: ["electric"] },
      };

      const response = await request(app.getHttpServer())
        .post("/api/characters/vote")
        .send(voteDto)
        .expect(201);

      expect(response.body).toMatchObject({
        externalId: voteDto.externalId,
        name: voteDto.name,
        likes: 1,
        dislikes: 0,
      });
    });

    it("should increment likes for existing character", async () => {
      const voteDto = {
        externalId: "test-pokemon-2",
        voteType: "like",
        name: "Test Pokemon 2",
        image: "https://example.com/image2.png",
        category: "pokemon",
      };

      // Primera votación
      await request(app.getHttpServer())
        .post("/api/characters/vote")
        .send(voteDto)
        .expect(201);

      // Segunda votación (like)
      const response = await request(app.getHttpServer())
        .post("/api/characters/vote")
        .send(voteDto)
        .expect(201);

      expect(response.body.likes).toBe(2);
      expect(response.body.dislikes).toBe(0);
    });

    it("should increment dislikes when voting dislike", async () => {
      const voteDto = {
        externalId: "test-pokemon-3",
        voteType: "dislike",
        name: "Test Pokemon 3",
        image: "https://example.com/image3.png",
        category: "pokemon",
      };

      const response = await request(app.getHttpServer())
        .post("/api/characters/vote")
        .send(voteDto)
        .expect(201);

      expect(response.body.likes).toBe(0);
      expect(response.body.dislikes).toBe(1);
    });

    it("should fail with invalid vote type", async () => {
      const invalidVote = {
        externalId: "test-pokemon-4",
        voteType: "invalid",
        name: "Test Pokemon 4",
        image: "https://example.com/image4.png",
        category: "pokemon",
      };

      return request(app.getHttpServer())
        .post("/api/characters/vote")
        .send(invalidVote)
        .expect(400);
    });

    it("should fail with missing required fields", async () => {
      const incompleteVote = {
        externalId: "test-pokemon-5",
        voteType: "like",
      };

      return request(app.getHttpServer())
        .post("/api/characters/vote")
        .send(incompleteVote)
        .expect(400);
    });
  });

  describe("/api/characters/stats (GET)", () => {
    beforeEach(async () => {
      // crea datos de prueba
      await request(app.getHttpServer()).post("/api/characters/vote").send({
        externalId: "test-most-liked",
        voteType: "like",
        name: "Most Liked Character",
        image: "https://example.com/liked.png",
        category: "pokemon",
      });

      await request(app.getHttpServer()).post("/api/characters/vote").send({
        externalId: "test-most-liked",
        voteType: "like",
        name: "Most Liked Character",
        image: "https://example.com/liked.png",
        category: "pokemon",
      });

      await request(app.getHttpServer()).post("/api/characters/vote").send({
        externalId: "test-most-disliked",
        voteType: "dislike",
        name: "Most Disliked Character",
        image: "https://example.com/disliked.png",
        category: "rickandmorty",
      });

      await request(app.getHttpServer()).post("/api/characters/vote").send({
        externalId: "test-most-disliked",
        voteType: "dislike",
        name: "Most Disliked Character",
        image: "https://example.com/disliked.png",
        category: "rickandmorty",
      });

      await request(app.getHttpServer()).post("/api/characters/vote").send({
        externalId: "test-most-disliked",
        voteType: "dislike",
        name: "Most Disliked Character",
        image: "https://example.com/disliked.png",
        category: "rickandmorty",
      });
    });

    it("should return correct statistics", async () => {
      const response = await request(app.getHttpServer())
        .get("/api/characters/stats")
        .expect(200);

      expect(response.body.totalCharacters).toBe(2);
      expect(response.body.totalVotes).toBe(5);
      expect(response.body.mostLiked).toBeDefined();
      expect(response.body.mostLiked.name).toBe("Most Liked Character");
      expect(response.body.mostLiked.likes).toBe(2);
      expect(response.body.mostDisliked).toBeDefined();
      expect(response.body.mostDisliked.name).toBe("Most Disliked Character");
      expect(response.body.mostDisliked.dislikes).toBe(3);
    });
  });

  describe("/api/characters/most-liked (GET)", () => {
    it("should return 404 when no characters exist", () => {
      return request(app.getHttpServer())
        .get("/api/characters/most-liked")
        .expect(404);
    });

    it("should return the most liked character", async () => {
      // crea personaje con likes
      await request(app.getHttpServer()).post("/api/characters/vote").send({
        externalId: "test-liked",
        voteType: "like",
        name: "Liked Character",
        image: "https://example.com/liked.png",
        category: "pokemon",
      });

      const response = await request(app.getHttpServer())
        .get("/api/characters/most-liked")
        .expect(200);

      expect(response.body.name).toBe("Liked Character");
      expect(response.body.likes).toBeGreaterThan(0);
    });
  });

  describe("/api/characters/most-disliked (GET)", () => {
    it("should return 404 when no characters exist", () => {
      return request(app.getHttpServer())
        .get("/api/characters/most-disliked")
        .expect(404);
    });

    it("should return the most disliked character", async () => {
      // crea personaje con dislikes
      await request(app.getHttpServer()).post("/api/characters/vote").send({
        externalId: "test-disliked",
        voteType: "dislike",
        name: "Disliked Character",
        image: "https://example.com/disliked.png",
        category: "superhero",
      });

      const response = await request(app.getHttpServer())
        .get("/api/characters/most-disliked")
        .expect(200);

      expect(response.body.name).toBe("Disliked Character");
      expect(response.body.dislikes).toBeGreaterThan(0);
    });
  });

  describe("/api/characters/pikachu/status (GET)", () => {
    it("should return exists: false when pikachu has not been voted", () => {
      return request(app.getHttpServer())
        .get("/api/characters/pikachu/status")
        .expect(200)
        .expect((res) => {
          expect(res.body.exists).toBe(false);
          expect(res.body.message).toContain("aún no ha sido evaluado");
        });
    });

    it("should return pikachu data when it exists", async () => {
      // crea pikachu con votos
      await request(app.getHttpServer()).post("/api/characters/vote").send({
        externalId: "pokemon-25",
        voteType: "like",
        name: "Pikachu",
        image: "https://example.com/pikachu.png",
        category: "pokemon",
      });

      const response = await request(app.getHttpServer())
        .get("/api/characters/pikachu/status")
        .expect(200);

      expect(response.body.exists).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.name).toBe("Pikachu");
      expect(response.body.message).toContain("Pikachu ha sido evaluado");
    });
  });
});
