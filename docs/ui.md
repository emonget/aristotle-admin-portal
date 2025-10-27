# UI Proposal

## Nav-menu
SPA routing to toggle between following Views/Screens :
- [Movies and reviews](#main-view)
- [Workflows monitoring](#workflows-monitoring-view)
- [Reporting & stats](#reportinganalytics-view)

**Suggested layout** 

Icon before View/Screen title customized depending on selected view (camera clip for Movies and reviews, Chart for stats, ...). 
When user click nav menu icon, it will show dropdown populated with other view name, to select another view. 
For unimplemented views, show placeholder with view title and empty content.

**Alternative layout**
3 icons for each views at top left corner, with current view highlighted

```

```



## Movies and reviews view
### Overview

**Components**
- [Movie timeline](#movies-timeline-top) (***proposed feat***)
- [Movie panel](#movies-panel-left-side)
- [Review panel](#reviews-panel-right-side)

### Movies timeline (top)

***TODO***

### Movies panel (left side)

**Description**

 Browse all movies 
   - Reference for data model: [movies-table](/docs/data-model.md#movies-table)
   - Data table with columns: Title, EMS ID, Review Count, Fetch Date
   - Search/filter by title or EMS ID
   - Click movie to select and populate reviews panel

**List preview**

```
+------------------------------------------+
| MOVIES                                   |
| [Search: _________________]              |
+------------------------------------------+
| Title          | ID   | Rev Cnt | Date |^|
|----------------------------------------| |
| Movie 1        | 001  | 5       |01/15 | |
|----------------------------------------| |
| Movie 2        | 002  | 3       |02/20 | |
|----------------------------------------| |
| Movie 3        | 003  | 8       |03/10 | |
|----------------------------------------| |
| Movie 4        | 004  | 12      |04/05 | |
|----------------------------------------| |
| Movie 5        | 005  | 7       |05/12 | |
|-----------------------------------------v|
+------------------------------------------+
| Movies: 150  |  Total Reviews: 1,234     |
+------------------------------------------+
```

### Reviews panel (right side)

**Description**

Reviews for selected movie
   - Reference for data model: [reviews-table](/docs/data-model.md#reviews-table) 
   - List showing reviews for the currently selected movie
   - Displays: Review ID, Source URL (domain only), Fetch Date, Critic Name (if available)
   - Click review to open the source URL in a new browser tab (no modal)
   - Top critic reviews originates from `isTopCritic` flag defined in [reviews table](/docs/data-model.md#reviews-table)
   - Mark top critic reviews with single star (☆) 
   - List top critic reviews first

**Item preview**

```
| |--------------------------------------| |
| | critics.com            ID: R003      | |
| | 03/10/2024             Bob Johnson   | |
| +--------------------------------------+ |
```

**List preview**
```
+------------------------------------------+
| REVIEWS                                  |
| Movie Title Here                         |
| ID: 001                                  |
+------------------------------------------+
| +--------------------------------------+^|
| | domain.com             ID: R001      | |
| | 01/15/2024             John Smith    | |
| +--------------------------------------+ |
| |--------------------------------------| |
| | moviesite.com          ID: R002      | |
| | 02/20/2024             Jane Doe      | |
| +--------------------------------------+ |
| |--------------------------------------| |
| | critics.com            ID: R003      | |
| | 03/10/2024             Bob Johnson   | |
| +--------------------------------------+ |
| |--------------------------------------| |
| | reviews.net            ID: R004      | |
| | 04/05/2024             Alice Brown   | |
| +--------------------------------------+v|
+------------------------------------------+
| Reviews: 12  |  Top Critics: 3           |
+------------------------------------------+
```


### View layout 

**Suggested view laoyout**

```
+--------------------------------------------------------------------------------+
|  |NAVMENU| PAGE TITLE                                                          |
+---------------------------------------+----------------------------------------+
| +-----------------------------------+ | +------------------------------------+ |
| | MOVIES                            | | | REVIEWS                            | |
| | [Search: __________________]      | | | Selected movie title               | |
| |                                   | | | ID: 001                            | |
| +-----------------------------------+ | +------------------------------------+ |
| | Title          |ID  |Rv |Date   |^| | +----------------------------------+^| |
| | Movie 1        |001 |5  |01/15  | | | | domain.com            ID: R001   | | |
| |---------------------------------| | | | 01/15/2024            John Smith | | |
| | Movie 2        |002 |3  |02/20  | | | |----------------------------------| | |
| |---------------------------------| | | | moviesite.com         ID: R002   | | |
| | Movie 3        |003 |8  |03/10  | | | | 02/20/2024            Jane Doe   | | |
| |---------------------------------| | | |----------------------------------| | |
| | Movie 4        |004 |12 |04/05  | | | | critics.com           ID: R003   | | |
| |---------------------------------| | | | 03/10/2024            Bob Johnson| | |
| | Movie 5        |003 |8  |03/10  | | | |----------------------------------| | |
| |---------------------------------| | | | reviews.net           ID: R004   | | |
| | Movie 6        |003 |8  |03/10  | | | | 04/05/2024            Alice Brown| | |
| |---------------------------------| | | +----------------------------------+ | |
| | Movie 7        |004 |12 |04/05  |v| | | nytimes.com           ID: R005   |v| |
| +-----------------------------------+ | +------------------------------------+ |
| | Movies: 150  | Total Reviews: 1K  | | | Reviews: 12  |  Top Critics: 3     | |
| +-----------------------------------+ | +------------------------------------+ |
+---------------------------------------+----------------------------------------+

```


## Workflows monitoring view

### Overview
Dashboard view for monitoring data retrieval workflows

**Components**
- [Movies workflow bar chart](#movies-bar-chart)
- [Reviews workflow bar chart](#reviews-bar-chart)
- [Worflow Details panel](#workflows-monitoring-view)

**Requirements**
- See all movie retrieval workflows, and associated movies 
- See all reviews retrieval workflows and associated reviews

**Features**
- Movies bar chart showing total number of movies in DB at each movie workflow execution (plus diff of added movies count)
- Reviews bar chart showing total number of reviews in DB at each review workflow execution (plus diff of added reviews count)
- Clicking a bar in chart will show workflow details

### Movies bar chart
Clicking a bar in the chart will show:
- movie workflow details: run date, time
- all movies retrieved during workflow execution

**Suggested chart**

```
```

### Reviews bar chart
Clicking a bar in the chart will show:
- worflow details:
- all reviews retrieved during worflow execution as

**Suggested chart**
```
```

### Worflow details panel
- movie or review workflow details depending on workflow type
- worflow items: movies or reviews depending on workflow type

**Suggested panel laoyout**
```
```

### View layout

**Suggested view laoyout**
```
```


## Analytics view

### Overview

**Purpose**

Provides analytics on review sources based on URL domains, helping administrators understand which review sources have the highest count of published reviews. This addresses the specific feature: "stats: extract all reviews unique sources (based on review url domain) and associated reviews count."

**Components**
- [Review sources analytics panel](#review-sources-analytics-panel)

### Review sources panel
**Suggested panel layout**
```
+----------------------------------------------------------------------------+
| REVIEW SOURCES                                                             |
+----------------------------------------------------------------------------+
|                                                                            |
| Variety.com    2,847 (18.2%) ██████████████████████████████                | 
| RT.com         2,123 (13.5%) ███████████████████████████                   | 
| The Guardian   1,892 (12.1%) █████████████████████████                     | 
| NYT.com        1,756 (11.2%) ████████████████████████                      | 
| BBC.com        1,543 (9.8%) ███████████████████████                        | 
| LA Times       1,298 (8.3%) █████████████████████                          | 
|                                                                            | 
+----------------------------------------------------------------------------+
| Total Sources: 47                            | Total Reviews: 15,697       |
+----------------------------------------------------------------------------+ 
```

### View layout
**Suggested view laoyout**
```
+--------------------------------------------------------------------------------+
| Analytics > Review Sources Analytics                                           |
+--------------------------------------------------------------------------------+
|                                                                                |

```