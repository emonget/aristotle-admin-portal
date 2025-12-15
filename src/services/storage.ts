import { supabase } from '@/lib/supabase'

export async function getMovieDigestVersions(movieId: string): Promise<string[]> {
  try {
    const bucketName = 'movie-reviews'
    const folderPath = `${movieId}`

    const { data: files, error: listError } = await supabase.storage
      .from(bucketName)
      .list(folderPath, {
        limit: 200,
        sortBy: { column: 'created_at', order: 'desc' },
      })

    if (listError) {
      console.error('Error listing files:', listError)
      return []
    }

    if (!files || files.length === 0) {
      return []
    }

    // Filter for digest files (stage5.*.md)
    return files
      .filter(file => file.name.startsWith('stage5.') && file.name.endsWith('.md'))
      .map(file => file.name)
  } catch (error) {
    console.error('Unexpected error fetching digest versions:', error)
    return []
  }
}

export async function getMovieDigestContent(movieId: string, fileName: string): Promise<string | null> {
  try {
    const bucketName = 'movie-reviews'
    const folderPath = `${movieId}`

    const { data: blob, error: downloadError } = await supabase.storage
      .from(bucketName)
      .download(`${folderPath}/${fileName}`)

    if (downloadError) {
      console.error('Error downloading digest:', downloadError)
      return null
    }

    return await blob.text()
  } catch (error) {
    console.error('Unexpected error fetching digest content:', error)
    return null
  }
}

export async function getMovieDigest(movieId: string): Promise<string | null> {
  try {
    const versions = await getMovieDigestVersions(movieId)
    
    if (versions.length === 0) {
      return null
    }

    // Since getMovieDigestVersions sorts by created_at desc (via Supabase list), the first one is the latest
    return await getMovieDigestContent(movieId, versions[0])
  } catch (error) {
    console.error('Unexpected error fetching digest:', error)
    return null
  }
}
