


// Mock bcrypt
jest.mock('bcrypt', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashedPassword')
}));

// Mock jwt
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-token')
}));

// Mock User Model
jest.mock("../Model/UserModel", () => {
  const MockModel = jest.fn(function (data) {
    Object.assign(this, data);
    this.save = jest.fn().mockResolvedValue(this);
    this.toObject = jest.fn().mockReturnValue({
      _id: 'mock-id',
      ...data,
      password: 'hashedPassword'
    });
  });

  MockModel.find = jest.fn().mockReturnValue({
    select: jest.fn().mockResolvedValue([
      { email: "one@test.com" },
      { email: "two@test.com" }
    ])
  });
  MockModel.findById = jest.fn();
  MockModel.findByIdAndUpdate = jest.fn();
  MockModel.findByIdAndDelete = jest.fn();
  MockModel.findOne = jest.fn().mockResolvedValue(null); // No existing user by default

  return MockModel;
});

const User = require("../Model/UserModel");
const { addUsers, getAllUsers } = require("../Controllers/UserController");


const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

afterEach(() => {
  jest.clearAllMocks();
});

test("addUsers returns 201 and created user on success", async () => {
  jest.setTimeout(10000); // Increase timeout to 10 seconds
  const req = {
    body: {
      email: "abc@test.com",
      password: "123456",
      name: "Loneesha",
      nic: "123456789",
      country: "Sri Lanka",
      gender: "Male",
      language: "English"
    }
  };
  const res = mockRes();

  await addUsers(req, res);

  expect(User).toHaveBeenCalledTimes(1);
  expect(User).toHaveBeenCalledWith({
    ...req.body,
    password: "hashedPassword" // This matches our mocked bcrypt hash
  });
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith({
    user: expect.objectContaining({
      name: "Loneesha",
      email: "abc@test.com"
    }),
    token: "mock-token"
  });
});

test("getAllUsers returns 200 and users array", async () => {
  const req = {};
  const res = mockRes();

  await getAllUsers(req, res);

  expect(User.find).toHaveBeenCalledTimes(1);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({
    success: true,
    users: [{ email: "one@test.com" }, { email: "two@test.com" }]
  });
});
