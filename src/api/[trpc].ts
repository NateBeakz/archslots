import { createYoga } from 'graphql-yoga';
import { createServer } from 'node:http';
import { youtube } from '@googleapis/youtube';

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const yt = youtube({
  version: 'v3',
  auth: API_KEY
});

export async function fetchYouTubeVideos() {
  try {
    console.log('Fetching YouTube videos...');
    const response = await yt.search.list({
      channelId: 'UCQ0v_neCHKP_9FwkBxYyBBA', // ArchSlots channel ID
      part: ['snippet'],
      order: 'date',
      maxResults: 3,
      type: ['video']
    });

    console.log('YouTube API Response:', {
      itemCount: response.data.items?.length || 0,
      pageInfo: response.data.pageInfo
    });

    return response.data.items?.map(item => ({
      id: item.id?.videoId || '',
      title: item.snippet?.title || '',
      thumbnail: item.snippet?.thumbnails?.maxres?.url || 
                item.snippet?.thumbnails?.high?.url || 
                `https://i.ytimg.com/vi/${item.id?.videoId}/hqdefault.jpg`
    })) || [];
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    throw error;
  }
} 