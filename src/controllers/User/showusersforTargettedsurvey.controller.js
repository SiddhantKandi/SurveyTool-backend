import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { User } from '../../models/users.models.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

//Getting targeted users from database
const getUsers = asyncHandler(async (req, res) => {
    try {
      // Fetch users with role 'targeted'
      const users = await User.find({
        role: { $in: ['targeted'] }
      });
  
      // Return the users in the response
      res.status(200).json(new ApiResponse(200,users, 'Users fetched successfully'));
    } catch (error) {
      throw new ApiError(400,{}, 'Failed to fetch users');
    }
  });
  
  export { getUsers };
  