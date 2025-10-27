# Functional side
## Overview

### Purpose
Frontend tool built on `React` + TS + TW + VITE stack acting as database admin portal.
Tool targetting very specific functional specifications and data model stored in predefined database (see [data-model](/docs/data-model.md) for reference).


### Main requirements/features
**movies and reviews data visualization**
- show movies timeline, with each movies by release date
- select specific movie from movies DB table and view all reviews linked to that movie

**workflow monitoring**
- See all movie retrieval workflows, and associated movies 
- See all reviews retrieval workflows/subworkflows and associated reviews

**reporting**
- report review broken links, failed review content capture

**stats** 
- stats: show bar chart graph representing all movies and reviews count in database over time at each workflow execution
- stats: extract all reviews unique sources (based on review url domain) and associated reviews count. This will help seeing which sources have highest count of published reviews

## Workflows
### Movies

This workflow is responsible for retrieving movie items and populate [DB movies table](/docs/data-model.md#movies-table)

### Reviews

This workflow is responsible for retrieving movie review items and populate [DB reviews table](/docs/data-model.md#reviews-table)

Two kind of movie retrieval workflows:

- **(parent or root) Workflow**

This parent workflow will trigger sub-workflows for each movies stored in DB.
Identified in DB by empty `parent_exec_id` field

- **sub-workflow**

Sub-workflow triggered from a parent workflow that focus on retrieving reviews for a specific movie id.

Identified in DB by non-empty `parent_exec_id` poiting to the parent workflow that initiated it.


# Data model
[data model](/docs/data-model.md)

# UI Proposal
[ui](/docs/ui.md)
