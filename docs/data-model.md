# Data model
## DB Schema
### Workflows table

```sql
CREATE TABLE workflow_executions (
  exec_id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL,
  parent_exec_id TEXT REFERENCES workflow_executions(exec_id),
  timestamp TIMESTAMP NOT NULL,
  metadata JSONB -- {status, changelog, ...}
);
```

### Movies table
```sql
CREATE TABLE movies (
  ems_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  data JSONB NOT NULL, -- Store entire API response
  fetched_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  workflow_exec_id TEXT REFERENCES workflow_executions(exec_id)
);
```

- `data` field see [movie](#movie-json-data)

### Reviews table
```sql
CREATE TABLE reviews (
  review_id TEXT PRIMARY KEY,
  movie_id TEXT NOT NULL REFERENCES movies(ems_id) ON DELETE CASCADE,
  data JSONB NOT NULL, -- Store entire review response
  fetched_at TIMESTAMP DEFAULT NOW(),
  workflow_exec_id TEXT REFERENCES workflow_executions(exec_id),
  CONSTRAINT fk_movie FOREIGN KEY (movie_id) REFERENCES movies(ems_id)
);
```
- `data` field see [review](#review-json-data)

## Specific fields
### movie JSON data
data field json structure from [movies table](#movies-table)
```json
{
    "audienceScore": {
        "scorePercent": ""
    },
    "criticsScore": {
        "certified": false,
        "scorePercent": ""
    },
    "emsId": "dcee4e37-65ab-4d3b-80a3-4c673cd0646c",
    "isVideo": true,
    "mediaUrl": "/m/tron_ares",
    "mpxId": "2439716419747",
    "publicId": "QovBNBGxp7PA",
    "posterUri": "https://resizing.flixster.com/K0aJjfOwbuXTvkIHadRQ2zRnJ5I=/206x305/v2/https://resizing.flixster.com/47cnXnHE1N213AgLnzYCVugVD0M=/ems.cHJkLWVtcy1hc3NldHMvbW92aWVzL2Q3Mzc1YWQ5LTIzYTQtNDY3My04YmVjLTNkM2VhZDg1NTE1NS5qcGc=",
    "releaseDateText": "Opens Oct 10, 2025",
    "title": "TRON: Ares",
    "type": "Movie"
}
```

### review JSON data

data field json structure from [review table](#reviews-table)

```json
{
    "creationDate": "Aug 2, 2025",
    "criticName": "Matthew Rozsa",
    "criticPictureUrl": "https://resizing.flixster.com/SHo6TQWnwW85IDB71FjtqFUWk0E=/fit-in/50x50/v2/https://resizing.flixster.com/D9-4yDZVrLXD_lzpFmvtI4vdToQ=/128x128/v1.YzszMzMwO2o7MjAzODU7MjA0ODs0MDA7NDAw",
    "criticPageUrl": "/critics/matthew-rozsa",
    "reviewState": "fresh",
    "isFresh": true,
    "isRotten": false,
    "isRtUrl": false,
    "isTopCritic": false,
    "publicationUrl": "/critics/source/1054",
    "publicationName": "Reason Online",
    "reviewUrl": "https://reason.com/2025/08/02/science-needs-dissent-nih-director-jay-bhattacharya-on-covid-autism-and-climate-change/",
    "quote": "The 1957 courtroom drama &#40;based on an acclaimed 1954 teleplay&#41; celebrates reasoned dissent&#44; open debate&#44; and the power of a single voice challenging consensus&#44; principles Bhattacharya values deeply&#44; especially in science&#46;",
    "reviewId": "103041921",
    "originalScore": "4/4",
    "scoreSentiment": "POSITIVE"
}
```