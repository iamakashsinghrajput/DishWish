import mongoose from 'mongoose';

// Mock the entire dbConnect module to bypass real DB connection and MONGO_URI check
jest.mock('../../lib/db', () => ({
  __esModule: true,
  default: jest.fn(() => Promise.resolve()),
}));

// Mock UserModel methods to avoid real DB calls
jest.mock('../../models/User', () => {
  return {
    __esModule: true,
    default: {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(null),
    },
  };
});

// Mock process.env to include MONGO_URI to bypass environment variable check
process.env.MONGO_URI = 'mocked_mongo_uri';

beforeAll(async () => {
  // Mock mongoose connect to avoid real DB connection
  jest.spyOn(mongoose, 'connect').mockImplementation(() => Promise.resolve(mongoose));
});

afterAll(async () => {
  jest.restoreAllMocks();
});

// Dummy test to avoid empty test suite error
describe('jest setup dummy test', () => {
  it('should pass this dummy test', () => {
    expect(true).toBe(true);
  });
});
