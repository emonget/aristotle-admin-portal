// debug-workflows.mjs
  import { createClient } from '@supabase/supabase-js'
  import dotenv from 'dotenv'

  // Load environment variables
  dotenv.config({ path: '.env.local' })

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  async function debugWorkflowData() {
    try {
      console.log('=== WORKFLOW EXECUTIONS DEBUG ===\n')

      // Check workflow executions
      const { data: executions, error: execError } = await supabase
        .from('workflow_executions')
        .select('*')
        .order('timestamp', { ascending: true })

      if (execError) throw execError
      console.log('Workflow executions found:', executions?.length || 0)
      console.log('Workflow executions:', executions || 'None')

      // Check for movies_workflow specifically
      const moviesWorkflow = executions?.filter(e => e.workflow_id ===
  'movies_workflow') || []
      console.log('\nMovies workflow executions:',
  moviesWorkflow.length)
      console.log('Movies workflow executions:', moviesWorkflow)

      // Check for reviews_workflow specifically  
      const reviewsWorkflow = executions?.filter(e => e.workflow_id ===
  'reviews_workflow') || []
      console.log('\nReviews workflow executions:',
  reviewsWorkflow.length)
      console.log('Reviews workflow executions:', reviewsWorkflow)

      // Check movies table for workflow_exec_id
      console.log('\n=== MOVIES DATA DEBUG ===')
      const { data: movies, error: moviesError } = await supabase
        .from('movies')
        .select('ems_id, workflow_exec_id')
        .limit(10)

      if (moviesError) throw moviesError
      console.log('Sample movies with workflow_exec_id:', movies ||
  'None')

      const moviesWithExecId = movies?.filter(m => m.workflow_exec_id)
  || []
      console.log('Movies with workflow_exec_id:',
  moviesWithExecId.length)

      // Check reviews table
      console.log('\n=== REVIEWS DATA DEBUG ===')
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('review_id, workflow_exec_id')
        .limit(10)

      if (reviewsError) throw reviewsError
      console.log('Sample reviews with workflow_exec_id:', reviews ||
  'None')

      const reviewsWithExecId = reviews?.filter(r => r.workflow_exec_id)
   || []
      console.log('Reviews with workflow_exec_id:',
  reviewsWithExecId.length)

    } catch (error) {
      console.error('Debug error:', error.message)
    }
  }

  debugWorkflowData()