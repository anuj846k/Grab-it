# Grab It

Grab It is a local giving marketplace where people offer items they no longer need and others claim them for pickup.

## Language

**Listing**:
An item offered by a giver for someone else to claim.

**Listing Status**:
The state of a Listing. A Listing is either Active, meaning it is still open to be claimed, or Claimed, meaning it has already been taken.
_Avoid_: Available, Pending

**Owner**:
The person who created a listing and is giving away the item. The canonical term for code and UI.
_Avoid_: Giver (in code)

**Requester**:
The person who claims (requests) an item from a listing. Stored as `requester_id` in the `claims` table.

**Claim**:
A request from a requester to an owner for a specific listing. A claim has a status of `pending`, `accepted`, or `rejected`.

**Conversation**:
A chat thread between an owner and a requester about a specific listing. Created automatically when a claim is accepted. A conversation is tied to exactly one listing and involves exactly two participants.

**Message**:
A single message within a conversation. Contains text content, sender reference, and timestamp.
