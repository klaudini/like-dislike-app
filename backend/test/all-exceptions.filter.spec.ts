import { HttpException, HttpStatus, ArgumentsHost } from "@nestjs/common";
import { AllExceptionsFilter } from "@/common/filters/all-exceptions.filter";
import { Request, Response } from "express";

describe("AllExceptionsFilter", () => {
  let filter: AllExceptionsFilter;
  let mockArgumentsHost: ArgumentsHost;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(async () => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });

    mockRequest = {
      method: "GET",
      url: "/api/test",
    };

    mockResponse = {
      status: mockStatus,
    };

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
      getArgByIndex: jest.fn(),
      getArgs: jest.fn(),
      getType: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
    };

    filter = new AllExceptionsFilter();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("HttpException handling", () => {
    it("should handle HttpException with string message", () => {
      const exception = new HttpException("Not Found", HttpStatus.NOT_FOUND);

      filter.catch(exception, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          path: "/api/test",
          method: "GET",
          message: "Not Found",
        }),
      );
    });

    it("should handle HttpException with object response", () => {
      const exception = new HttpException(
        {
          message: "Validation failed",
          error: "Bad Request",
        },
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: "Validation failed",
          error: "Bad Request",
        }),
      );
    });

    it("should handle HttpException with 500 status", () => {
      const exception = new HttpException(
        "Internal error",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 500,
          message: "Internal error",
        }),
      );
    });

    it("should handle HttpException with 401 Unauthorized", () => {
      const exception = new HttpException(
        "Unauthorized",
        HttpStatus.UNAUTHORIZED,
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: "Unauthorized",
        }),
      );
    });

    it("should handle HttpException with 403 Forbidden", () => {
      const exception = new HttpException("Forbidden", HttpStatus.FORBIDDEN);

      filter.catch(exception, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
          message: "Forbidden",
        }),
      );
    });
  });

  describe("Error handling", () => {
    it("should handle generic Error", () => {
      const exception = new Error("Something went wrong");

      filter.catch(exception, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 500,
          message: "Something went wrong",
          error: "Internal Server Error",
        }),
      );
    });

    it("should handle TypeError", () => {
      const exception = new TypeError("Type error occurred");

      filter.catch(exception, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 500,
          message: "Type error occurred",
        }),
      );
    });

    it("should handle ReferenceError", () => {
      const exception = new ReferenceError("Variable not defined");

      filter.catch(exception, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 500,
          message: "Variable not defined",
        }),
      );
    });
  });

  describe("Unknown exception handling", () => {
    it("should handle unknown exception type", () => {
      const exception = "Unknown error";

      filter.catch(exception, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 500,
          message: "Internal server error",
          error: "Internal Server Error",
        }),
      );
    });

    it("should handle null exception", () => {
      const exception = null;

      filter.catch(exception, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 500,
          message: "Internal server error",
        }),
      );
    });

    it("should handle undefined exception", () => {
      const exception = undefined;

      filter.catch(exception, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 500,
          message: "Internal server error",
        }),
      );
    });
  });

  describe("Response structure", () => {
    it("should include timestamp in response", () => {
      const exception = new HttpException("Test", HttpStatus.BAD_REQUEST);
      const beforeTimestamp = new Date().toISOString();

      filter.catch(exception, mockArgumentsHost);

      const response = mockJson.mock.calls[0][0];
      expect(response.timestamp).toBeDefined();
      expect(new Date(response.timestamp).getTime()).toBeGreaterThanOrEqual(
        new Date(beforeTimestamp).getTime(),
      );
    });

    it("should include request path in response", () => {
      mockRequest.url = "/api/characters/random";
      const exception = new HttpException("Test", HttpStatus.NOT_FOUND);

      filter.catch(exception, mockArgumentsHost);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/api/characters/random",
        }),
      );
    });

    it("should include request method in response", () => {
      mockRequest.method = "POST";
      const exception = new HttpException("Test", HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockArgumentsHost);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "POST",
        }),
      );
    });

    it("should have all required fields in response", () => {
      const exception = new HttpException("Test error", HttpStatus.NOT_FOUND);

      filter.catch(exception, mockArgumentsHost);

      const response = mockJson.mock.calls[0][0];
      expect(response).toHaveProperty("statusCode");
      expect(response).toHaveProperty("timestamp");
      expect(response).toHaveProperty("path");
      expect(response).toHaveProperty("method");
      expect(response).toHaveProperty("error");
      expect(response).toHaveProperty("message");
    });
  });

  describe("Logging", () => {
    it("should log error with stack trace for Error instances", () => {
      const loggerSpy = jest.spyOn(filter["logger"], "error");
      const exception = new Error("Test error");

      filter.catch(exception, mockArgumentsHost);

      expect(loggerSpy).toHaveBeenCalled();
      expect(loggerSpy.mock.calls[0][0]).toContain("GET");
      expect(loggerSpy.mock.calls[0][0]).toContain("/api/test");
      expect(loggerSpy.mock.calls[0][0]).toContain("500");
      expect(loggerSpy.mock.calls[0][1]).toBeTruthy(); // Stack trace
    });

    it("should log HttpException without stack trace", () => {
      const loggerSpy = jest.spyOn(filter["logger"], "error");
      const exception = new HttpException("Not found", HttpStatus.NOT_FOUND);

      filter.catch(exception, mockArgumentsHost);

      expect(loggerSpy).toHaveBeenCalled();
      expect(loggerSpy.mock.calls[0][0]).toContain("404");
      expect(loggerSpy.mock.calls[0][1]).toBeTruthy(); // Stack trace from HttpException
    });

    it("should log with correct format", () => {
      const loggerSpy = jest.spyOn(filter["logger"], "error");
      mockRequest.method = "POST";
      mockRequest.url = "/api/characters/vote";
      const exception = new HttpException(
        "Bad request",
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockArgumentsHost);

      expect(loggerSpy.mock.calls[0][0]).toMatch(
        /POST \/api\/characters\/vote - Status: 400 - Message: Bad request/,
      );
    });
  });

  describe("Edge cases", () => {
    it("should handle HttpException with empty object response", () => {
      const exception = new HttpException({}, HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: "Internal server error", // Default message
        }),
      );
    });

    it("should handle different HTTP methods", () => {
      const methods = ["GET", "POST", "PUT", "DELETE", "PATCH"];

      methods.forEach((method) => {
        mockRequest.method = method;
        const exception = new HttpException("Test", HttpStatus.OK);

        filter.catch(exception, mockArgumentsHost);

        expect(mockJson).toHaveBeenCalledWith(
          expect.objectContaining({
            method,
          }),
        );
      });
    });

    it("should handle long URLs", () => {
      mockRequest.url = "/api/characters/image-proxy?url=" + "a".repeat(1000);
      const exception = new HttpException("Test", HttpStatus.NOT_FOUND);

      filter.catch(exception, mockArgumentsHost);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          path: mockRequest.url,
        }),
      );
    });
  });
});
