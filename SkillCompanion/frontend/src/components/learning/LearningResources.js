import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardMedia, CardContent, CardActions, Button, Chip, CircularProgress, Tabs, Tab, AppBar, Divider, Link } from '@mui/material';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import YouTubeIcon from '@mui/icons-material/YouTube';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SchoolIcon from '@mui/icons-material/School';
import { fetchLearningResourcesForSkill } from '../../services/apiService';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`learning-tabpanel-${index}`}
      aria-labelledby={`learning-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const LearningResources = ({ skillName }) => {
  const [resources, setResources] = useState([]);
  const [groupedResources, setGroupedResources] = useState({
    youtube: [],
    coursera: [],
    documentation: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const getResources = async () => {
      if (!skillName) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetchLearningResourcesForSkill(skillName);
        
        if (response.success) {
          setResources(response.data || []);
          
          // If the API provides grouped data, use it
          if (response.groupedData) {
            setGroupedResources(response.groupedData);
          } else {
            // Otherwise, manually group by source
            const grouped = {
              youtube: response.data.filter(r => r.source === 'YouTube' || (!r.source && !r.type)),
              coursera: response.data.filter(r => r.source === 'Coursera'),
              documentation: response.data.filter(r => r.source === 'Documentation' || r.type === 'documentation')
            };
            setGroupedResources(grouped);
          }
        } else {
          setError('Failed to load learning resources');
          setResources([]);
        }
      } catch (err) {
        console.error('Error fetching learning resources:', err);
        setError('Failed to load learning resources. Trying fallback options...');
        setResources([]);
      } finally {
        setLoading(false);
      }
    };
    
    getResources();
  }, [skillName]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && resources.length === 0) {
    return (
      <Box p={3}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (resources.length === 0) {
    return (
      <Box p={3}>
        <Typography>No learning resources found for {skillName}.</Typography>
      </Box>
    );
  }
  
  // Calculate tab counts
  const youtubeCount = groupedResources.youtube.length;
  const courseraCount = groupedResources.coursera.length;
  const docsCount = groupedResources.documentation.length;

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Learning Resources for {skillName}
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="fullWidth"
          aria-label="Learning resource tabs"
        >
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <YouTubeIcon sx={{ mr: 1 }} />
                <span>YouTube</span>
                {youtubeCount > 0 && <Chip size="small" label={youtubeCount} sx={{ ml: 1 }} />}
              </Box>
            } 
            id="learning-tab-0" 
            aria-controls="learning-tabpanel-0" 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SchoolIcon sx={{ mr: 1 }} />
                <span>Coursera</span>
                {courseraCount > 0 && <Chip size="small" label={courseraCount} sx={{ ml: 1 }} />}
              </Box>
            } 
            id="learning-tab-1" 
            aria-controls="learning-tabpanel-1" 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <MenuBookIcon sx={{ mr: 1 }} />
                <span>Documentation</span>
                {docsCount > 0 && <Chip size="small" label={docsCount} sx={{ ml: 1 }} />}
              </Box>
            } 
            id="learning-tab-2" 
            aria-controls="learning-tabpanel-2" 
          />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        <ResourceList resources={groupedResources.youtube} type="YouTube" />
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <ResourceList resources={groupedResources.coursera} type="Coursera" />
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        <ResourceList resources={groupedResources.documentation} type="Documentation" />
      </TabPanel>
    </Box>
  );
};

const ResourceList = ({ resources, type }) => {
  if (!resources || resources.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary" align="center" p={3}>
        No {type} resources available for this skill. We only show resources that are directly relevant to the skill.
      </Typography>
    );
  }

  return (
    <Grid container spacing={3}>
      {resources.map((resource, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <ResourceCard resource={resource} type={type} />
        </Grid>
      ))}
    </Grid>
  );
};

const ResourceCard = ({ resource, type }) => {
  // Determine source icon
  let SourceIcon = MenuBookIcon;
  if (type === 'YouTube') SourceIcon = YouTubeIcon;
  if (type === 'Coursera') SourceIcon = SchoolIcon;

  // Format view count if available
  const viewCountDisplay = resource.viewCount 
    ? `${resource.viewCount} views` 
    : '';
    
  // Format duration if available (different for Coursera)
  const durationDisplay = resource.duration || '';

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 6
        }
      }}
    >
      <CardMedia
        component="img"
        height="160"
        image={resource.thumbnail || 'https://via.placeholder.com/160x90.png?text=No+Thumbnail'}
        alt={resource.title}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle1" component="h3" gutterBottom noWrap title={resource.title}>
          {resource.title}
        </Typography>
        
        <Box display="flex" alignItems="center" mb={1}>
          <SourceIcon color="primary" fontSize="small" sx={{ mr: 0.5 }} />
          <Typography variant="caption" color="text.secondary">
            {resource.source || type}
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {resource.author}
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
          {viewCountDisplay && (
            <Chip 
              size="small" 
              label={viewCountDisplay} 
              variant="outlined" 
              sx={{ fontSize: '0.7rem' }} 
            />
          )}
          {durationDisplay && (
            <Chip 
              size="small" 
              label={durationDisplay} 
              variant="outlined" 
              sx={{ fontSize: '0.7rem' }} 
            />
          )}
        </Box>
        
        <Divider sx={{ my: 1 }} />
        
        <Typography variant="body2" color="text.secondary" sx={{
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 3,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          lineHeight: '1.3em',
          height: '3.9em'
        }}>
          {resource.description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button 
          size="small" 
          endIcon={<ArrowOutwardIcon />} 
          component="a"
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          fullWidth
        >
          View {type === 'YouTube' ? 'Video' : type === 'Coursera' ? 'Course' : 'Resource'}
        </Button>
      </CardActions>
    </Card>
  );
};

export default LearningResources; 