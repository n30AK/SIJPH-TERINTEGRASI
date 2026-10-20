# Legal source status verification API

`POST /api/admin/legal/verify` records a human review of a legal document version and its legal status. It is protected by the server-only `SIJPH_ADMIN_API_KEY` header.

```json
{
  "documentId": "UUID-DOKUMEN",
  "versionId": "UUID-VERSI",
  "reviewerUserId": "UUID-REVIEWER",
  "legalStatus": "in_force",
  "verificationNote": "Diperiksa pada portal resmi; nomor, tanggal berlaku, dan metadata cocok dengan dokumen sumber.",
  "effectiveUntil": "2030-12-31"
}
```

The reviewer must exist in `app_users`; the selected version must belong to the selected document; the source must be active and tagged `primary_official`. The transaction marks the version verified and records the selected legal status with the current verification timestamp. `effectiveUntil` is optional and should only be supplied when supported by the official source.

**Operational controls:** This endpoint is an initial admin workflow, not complete RBAC. Before production, require individual authenticated sessions, organization/case scope, evidence URL/hash capture, two-person approval for revocation/critical status changes, and tamper-resistant audit retention. Global legal sources currently accept a reviewer role assigned within any organization. Never verify based on model memory or secondary sources alone. Confirm amendment/revocation relationships and effective dates separately; this endpoint does not infer those relationships.
