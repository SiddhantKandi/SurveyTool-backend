import { ApiError } from '../../utils/ApiError.js'
import { ApiResponse } from '../../utils/ApiResponse.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import axios from 'axios'

const getLocation = asyncHandler(async (req, res) => {
    const { latitude, longitude } = req.query;

    const response = await axios.get(
        process.env.GEOENCODING_API,
        {
            params: {
                "api-version": "1.0",
                query: `${latitude},${longitude}`,
                "subscription-key": process.env
                    .AZURE_SUBSCRIPTION_KEY, // Replace with your Azure Maps API key
            },
        }
    );

    if (!response) {
        throw new ApiError(400, {}, "Location and address could not be fetched.")
    }

    const addressData = response.data?.addresses?.[0]?.address || {};

    const address = `${addressData.countrySecondarySubdivision || ""
        }, ${addressData.countrySubdivision || ""}, ${addressData.country || ""
        }`.trim();

    return res.status(200).json(
        new ApiResponse(200, address , "Location and address fetched successfully")
    )
})

export { getLocation };