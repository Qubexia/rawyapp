# API Contracts: Podcast and Episode Management

## Podcasts API

### Create Podcast

**Endpoint**: `POST /podcasts`  
**Auth**: Required (Creator role)

**Request Body**:
```json
{
  "title": "string (required, 3-100 chars)",
  "description": "string (required, 10-2000 chars)",
  "category": "string (optional, enum values)",
  "coverImageUrl": "string (optional, URL)"
}
```

**Response** (201):
```json
{
  "id": "ObjectId",
  "title": "string",
  "description": "string",
  "coverImageUrl": "string | null",
  "creatorId": "ObjectId",
  "episodeCount": "number",
  "category": "string | null",
  "status": "draft",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

### List Podcasts

**Endpoint**: `GET /podcasts`  
**Auth**: Optional

**Query Parameters**:
- `page`: number (default: 1)
- `limit`: number (default: 10)
- `category`: string (optional filter)
- `search`: string (optional text search)
- `status`: string (optional filter: draft/published)

**Response** (200):
```json
{
  "data": [Podcast],
  "total": "number",
  "page": "number",
  "limit": "number",
  "totalPages": "number"
}
```

### Get Podcast

**Endpoint**: `GET /podcasts/:id`  
**Auth**: Optional

**Response** (200): Podcast object

### Update Podcast

**Endpoint**: `PATCH /podcasts/:id`  
**Auth**: Required (Owner or Admin)

**Request Body**: Partial podcast fields

**Response** (200): Updated podcast

### Delete Podcast

**Endpoint**: `DELETE /podcasts/:id`  
**Auth**: Required (Owner or Admin)

**Response** (200): Success message

### Publish Podcast

**Endpoint**: `POST /podcasts/:id/publish`  
**Auth**: Required (Owner)

**Response** (200): Published podcast

---

## Episodes API

### Create Episode

**Endpoint**: `POST /episodes`  
**Auth**: Required (Creator role)

**Request Body**:
```json
{
  "title": "string (required, 3-200 chars)",
  "description": "string (required, 10-5000 chars)",
  "audioFileUrl": "string (required, URL)",
  "duration": "number (optional, seconds)",
  "podcastId": "ObjectId (required)",
  "imageUrl": "string (optional, URL)"
}
```

**Response** (201): Episode object

### List Episodes

**Endpoint**: `GET /episodes`  
**Auth**: Optional

**Query Parameters**:
- `page`: number
- `limit`: number
- `podcastId`: ObjectId (filter by podcast)

**Response** (200):
```json
{
  "data": [Episode],
  "total": "number",
  "page": "number",
  "limit": "number",
  "totalPages": "number"
}
```

### Get Episode

**Endpoint**: `GET /episodes/:id`  
**Auth**: Optional

**Response** (200): Episode object

### Update Episode

**Endpoint**: `PATCH /episodes/:id`  
**Auth**: Required (Owner or Admin)

**Response** (200): Updated episode

### Delete Episode

**Endpoint**: `DELETE /episodes/:id`  
**Auth**: Required (Owner or Admin)

**Response** (200): Success message

---

## Admin API

### List All Podcasts (Admin)

**Endpoint**: `GET /admin/podcasts`  
**Auth**: Required (Admin role)

**Query Parameters**:
- `page`, `limit`
- `search`, `category`, `status`

**Response** (200): Paginated podcasts

### List All Episodes (Admin)

**Endpoint**: `GET /admin/episodes`  
**Auth**: Required (Admin role)

**Query Parameters**:
- `page`, `limit`
- `podcastId`, `search`

**Response** (200): Paginated episodes

### Get Platform Stats

**Endpoint**: `GET /admin/stats`  
**Auth**: Required (Admin role)

**Response** (200):
```json
{
  "totalUsers": "number",
  "totalCreators": "number",
  "totalPodcasts": "number",
  "totalEpisodes": "number"
}
```

---

## Health Check

### Backend Connectivity

**Endpoint**: `GET /health` or `GET /admin/system/health`  
**Auth**: Optional

**Response** (200):
```json
{
  "status": "ok",
  "timestamp": "ISO8601"
}
```
