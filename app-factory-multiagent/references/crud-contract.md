# CRUD Contract

Use this for every core entity unless the approved design explicitly narrows scope.

## Default Endpoint Set

For entity `items`:

- `GET /api/items` for list
- `POST /api/items` for create
- `GET /api/items/[id]` for detail
- `PUT /api/items/[id]` for update
- `DELETE /api/items/[id]` for delete

## Required Behaviors

### List

- supports user scoping when data is private
- supports search, limit, and offset when relevant
- uses deterministic ordering

### Create

- validates required fields
- rejects malformed data
- writes only safe values
- returns the created record

### Get

- checks ownership or access rights
- returns `404` when the record is not found

### Update

- verifies the record exists and is accessible
- validates only supplied fields
- rejects empty updates
- updates timestamps when appropriate
- returns the updated record

### Delete

- verifies the record exists and is accessible
- returns a clear success response

## Validation Rules

- Required strings cannot be blank after trimming.
- Numeric fields must be validated for type and range.
- Enum-like fields must be checked against allowed values.
- Never trust client ownership fields; derive them from auth/session.

## Error Handling Rules

- `401` for unauthenticated access
- `403` if the caller is authenticated but forbidden
- `404` for missing resources
- `400` for bad inputs
- `500` only for unexpected server failures

## SQL Rules

- Use parameterized queries or safe tagged templates.
- Never interpolate user input into raw SQL strings.
- Use ownership checks in the same query when possible.
- Use transactions when multiple writes must succeed together.
- Create indexes for foreign keys and common lookups.

## Integration Rule

The `backend-builder` owns CRUD generation, but the `web-builder` and `mobile-builder` must consume the exact payload and error shapes. If the frontend needs a different shape, change the contract centrally instead of forking behavior per client.
