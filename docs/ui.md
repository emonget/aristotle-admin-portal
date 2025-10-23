# UI Layout Visualizations

## Stats Page - Review Sources Analytics

### Page Purpose
The Stats page provides analytics on review sources based on URL domains, helping administrators understand which review sources have the highest count of published reviews. This addresses the specific feature: "stats: extract all reviews unique sources (based on review url domain) and associated reviews count."

### Key Features
- **Visual Analytics**: Bar chart displaying review counts by source domain
- **Data Table**: Detailed breakdown with sortable/filterable source list
- **Time Range Filtering**: Filter analytics by date ranges
- **Export Options**: Export chart data or raw analytics to CSV/JSON

### Page Layout

```
+---------------------------------------------------------------------------------+
| Stats > Review Sources Analytics                                               |
+---------------------------------------------------------------------------------+
|                                                                                 |
| +----------------------------- Analytics Chart ---------------------------------+ |
| |                        Review Sources by Count                             | |
| |                          +------------------------+                         | |
| |                ████████ | Variety.com    2,847   |                         | |
| |          ██████████████ | RT.com         2,123   |                         | |
| |    ████████████████████ | The Guardian   1,892   |                         | |
| | ███████████████████████ | NYT.com        1,756   |                         | |
| |                         | BBC.com        1,543   |                         | |
| |                         | LA Times       1,298   |                         | |
| |                         +------------------------+                         | |
| +---------------------------------------------------------------------------+ |
|                                                                                 |
| +----------------------- Detailed Breakdown Table ----------------------------+ |
| | +-------------------------------------------------------------------------+ | |
| | | Source Domain     | Review Count | % of Total                       | | |
| | |-------------------+--------------+------------+-------------------------| | |
| | | variety.com       | 2,847        | 18.2%      | 2024-10-23 14:32       | | |
| | | rottentomatoes.com| 2,123        | 13.5%      | 2024-10-23 11:15       | | |
| | | theguardian.com   | 1,892        | 12.1%      | 2024-10-23 09:43       | | |
| | | nytimes.com       | 1,756        | 11.2%      | 2024-10-23 08:22       | | |
| | | bbc.com           | 1,543        | 9.8%       | 2024-10-22 21:07       | | |
| | | latimes.com       | 1,298        | 8.3%       | 2024-10-22 18:45       | | |
| | | washingtonpost.com| 1,056        | 6.7%       | 2024-10-22 16:33       | | |
| | | hollywoodreporter.| 987          | 6.3%       | 2024-10-22 14:12       | | |
| | | ...               | ...          | ...        | ...                     | | |
| | +-------------------------------------------------------------------------+ | |
| |                                                               [◄ Prev] [Next ▶] | |
| +---------------------------------------------------------------------------+ |
|                                                                                 |
| +--------------------------- Quick Stats -------------------------------------+ |
| | Total Sources: 47                            | Total Reviews: 15,697      | |
| +---------------------------------------------------------------------------+ |
+---------------------------------------------------------------------------------+
```

### Component Breakdown

1. **Filter Controls Section**
   - Date range picker for limiting analytics to specific time periods
   - Source domain text filter for narrowing down the view
   - Sort dropdown with options: Review Count, Source Name, Last Updated

2. **Analytics Chart Section**
   - Horizontal bar chart showing top sources by review count
   - Interactive tooltips showing exact counts on hover
   - Click bars to filter the table below to that source

3. **Detailed Breakdown Table**
   - Sortable columns: Source Domain, Review Count, Percentage, Last Review Date
   - Pagination for handling large datasets
   - Row highlighting and click-to-drill-down functionality

4. **Export Options Bar**
   - Multiple export formats: PNG/SVG for charts, CSV/Excel for data, JSON for API consumption
   - One-click export buttons with loading states

5. **Quick Stats Dashboard**
   - Summary metrics at a glance
   - Live update timestamps
   - Trend indicators showing growth/decline

### Technical Implementation Notes
- Chart powered by Chart.js or similar library
- Table uses sortable, paginated DataTable component
- Data fetched from reviews table aggregated by URL domain extraction
- Real-time updates every 5 minutes
- Export functionality generates downloadable files on-demand

### User Flow
1. User lands on Stats page → sees overview chart and stats
2. Applies date/source filters → chart/table update in real-time
3. Clicks chart bars → table filters to selected source
4. Sorts table by different metrics → data reorders instantly
5. Exports needed data → downloads generated in background