import { useState } from "react";
import { motion } from "framer-motion";
import ReactPlayer from "react-player";
import { useQuery } from "@tanstack/react-query";

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
}

export const StreamClipCarousel = () => {
  const [currentVideo, setCurrentVideo] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const { data: videos, isLoading, error } = useQuery<YouTubeVideo[]>({
    queryKey: ['youtube-videos'],
    queryFn: async () => {
      console.log('Fetching videos from API...');
      const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
      console.log('Environment check:', {
        hasApiKey: !!API_KEY,
        apiKeyLength: API_KEY?.length,
        envKeys: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'))
      });

      if (!API_KEY) {
        throw new Error('YouTube API key is not configured. Please check your .env.local file.');
      }

      // First, search for the channel
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=ArchSlots&type=channel&key=${API_KEY}`;
      console.log('Searching for channel...');
      
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();
      
      console.log('Search API Response:', {
        status: searchResponse.status,
        ok: searchResponse.ok,
        data: searchData,
        items: searchData.items,
        error: searchData.error
      });

      if (!searchResponse.ok) {
        throw new Error(searchData.error?.message || 'Failed to search for channel');
      }

      if (!searchData.items || searchData.items.length === 0) {
        console.error('Channel not found in search. Response:', searchData);
        throw new Error('Channel not found in search results');
      }

      const channelId = searchData.items[0].id.channelId;
      console.log('Found channel ID:', channelId);

      // Now get the channel's uploads playlist
      const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${API_KEY}`;
      console.log('Fetching channel details...');
      
      const channelResponse = await fetch(channelUrl);
      const channelData = await channelResponse.json();
      
      console.log('Channel API Response:', {
        status: channelResponse.status,
        ok: channelResponse.ok,
        data: channelData,
        items: channelData.items,
        error: channelData.error
      });

      if (!channelResponse.ok) {
        throw new Error(channelData.error?.message || 'Failed to fetch channel info');
      }

      if (!channelData.items || channelData.items.length === 0) {
        console.error('Channel details not found. Response:', channelData);
        throw new Error('Channel details not found');
      }

      if (!channelData.items[0]?.contentDetails?.relatedPlaylists?.uploads) {
        console.error('Channel found but no uploads playlist. Channel data:', channelData.items[0]);
        throw new Error('Could not find uploads playlist for channel');
      }

      const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;
      console.log('Found uploads playlist ID:', uploadsPlaylistId);
      
      // Get the videos from the uploads playlist
      const videosUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=3&key=${API_KEY}`;
      console.log('Fetching videos from playlist...');
      
      const videosResponse = await fetch(videosUrl);
      const videosData = await videosResponse.json();
      
      console.log('Videos API Response:', {
        status: videosResponse.status,
        ok: videosResponse.ok,
        data: videosData,
        items: videosData.items,
        error: videosData.error
      });

      if (!videosResponse.ok) {
        throw new Error(videosData.error?.message || 'Failed to fetch videos');
      }

      if (!videosData.items || videosData.items.length === 0) {
        console.error('No videos found in playlist:', videosData);
        throw new Error('No videos found');
      }

      return videosData.items.map(item => ({
        id: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.maxres?.url || 
                  item.snippet.thumbnails.high?.url || 
                  `https://i.ytimg.com/vi/${item.snippet.resourceId.videoId}/hqdefault.jpg`
      }));
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    retry: 1
  });

  const handleVideoEnd = () => {
    setIsPlaying(false);
    setCurrentVideo((prev) => (prev + 1) % (videos?.length || 1));
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, ease: [0.25, 0.8, 0.25, 1] }}
      className="py-16 md:py-24 px-4 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1a] via-[#1a1a2e] to-[#0a0a1a] opacity-90" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-arch-green/10 via-transparent to-transparent opacity-50" />
      <div className="container mx-auto relative z-10">
        <h2 className="text-3xl font-bold text-center mb-8">
          <span className="gradient-text">Latest Stream Highlights</span>
        </h2>
        
        <div className="relative max-w-4xl mx-auto">
          {isLoading ? (
            <div className="aspect-video bg-[#1a1a2e]/50 backdrop-blur-sm rounded-xl animate-pulse border border-white/5" />
          ) : error ? (
            <div className="aspect-video bg-[#1a1a2e]/50 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center p-4 border border-white/5">
              <p className="text-red-400 mb-2">Error loading videos</p>
              <p className="text-gray-400 text-sm text-center">{error instanceof Error ? error.message : 'Unknown error'}</p>
            </div>
          ) : videos && videos.length > 0 ? (
            <div className="aspect-video bg-[#1a1a2e]/50 backdrop-blur-sm rounded-xl overflow-hidden relative border border-white/5">
              <ReactPlayer
                url={`https://www.youtube.com/watch?v=${videos[currentVideo].id}`}
                width="100%"
                height="100%"
                playing={isPlaying}
                controls={true}
                onEnded={handleVideoEnd}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                light={!isPlaying ? videos[currentVideo].thumbnail : false}
                playIcon={
                  <div className="flex flex-col items-center">
                    <h3 className="text-xl font-semibold text-center px-4 mb-3 text-white">
                      {videos[currentVideo].title}
                    </h3>
                    <button
                      className="bg-arch-green/20 backdrop-blur px-5 py-2.5 rounded-full text-arch-green hover:bg-arch-green/30 transition-colors"
                    >
                      Play Video
                    </button>
                  </div>
                }
              />
            </div>
          ) : (
            <div className="aspect-video bg-[#1a1a2e]/50 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/5">
              <p className="text-gray-400">No videos available</p>
            </div>
          )}
          
          {videos && videos.length > 1 && !isPlaying && (
            <div className="flex justify-center gap-2 mt-4">
              {videos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentVideo(index);
                    setIsPlaying(false);
                  }}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    index === currentVideo ? 'bg-arch-green' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
};
