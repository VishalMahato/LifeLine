# Location API

## Base URL
`/api/locations/v1`

## Endpoints

### Create location
- `POST /`
- Creates a user location.
- Idempotent by `userId` (returns existing active location if already present).

### Create location from coordinates
- `POST /coordinates`
- Input latitude/longitude, resolves address server-side when possible.

### Update current location
- `POST /current`
- Upserts the user's `placeType: current` location.

### Get locations by user
- `GET /user/:userId`
- Returns active locations for a user.

### Get user stats
- `GET /user/:userId/stats`
- Returns location counts and last updated info.

### Search nearby locations
- `GET /nearby/search?lat=&lng=&radius=`
- Searches active locations using geospatial radius.

### Search nearby helpers
- `GET /nearby/helpers?lat=&lng=&radius=`
- Searches helper-linked locations near the given coordinates.

### Search with filters
- `GET /`
- Supports `userId`, `helperId`, `placeType`, `city`, `state`, `country`, `verified`, pagination and sorting params.

### Get location by id
- `GET /:id`

### Update location
- `PUT /:id`

### Patch address fields
- `PATCH /:id/address`
- Updates only address-related fields.

### Verify location
- `PATCH /:id/verify`

### Delete location
- `DELETE /:id`

## Response envelope
All endpoints return:

```json
{
  "success": true,
  "message": "optional",
  "data": {}
}
```
