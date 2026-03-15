# Architecture Discussion (Written - 30 minutes)
Answer briefly (2-3 paragraphs each):

## when would you choose MongoDB over a relational database for a new feature? What factors influence this decision?
Access patterns and data structure (or lack thereof) would influence the decision. MongoDB is fairly new to me, but from what I understand it works well for non-structured data such as audit logs.

## Describe how you would implement a feature that needs to process 10,000 records nightly (e.g., sending reminder emails). What patterns/tools would you use and why?
I would implement a scheduled task that runs nightly (CRON), using a job queue (RabbitMQ) to process records in batches (chunking records). Log progress and errors to make retries/reruns easier.

## A React component is re-rendering too frequently, causing performance issues. Walk through your debugging approach and potential solutions.
I would use React Profiler to inspect the component and identify the source of extra renders. Check for local state churn, parent re-renders, unstable props, recreated references, context updates, or effect loops. May add console logs or breakpoints to verify prop changes.