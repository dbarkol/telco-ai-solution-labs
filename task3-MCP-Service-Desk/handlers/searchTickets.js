
// searchSimilarTickets.js

/**
 * Simulates semantic similarity search for service tickets using vector embeddings
 * @param {string} searchQuery - The problem description to search for
 * @param {number} topK - Number of similar tickets to return (default: 5)
 * @returns {Object} Search results with similar tickets and RCAs
 */
function searchSimilarTickets(searchQuery, topK = 5) {
  // Mock ticket database with embeddings (in real implementation, these would be from vector DB)
  const ticketDatabase = [
    {
      ticketId: "TKT-2024-001234",
      shortDescription: "Internet connection drops frequently",
      longDescription: "Customer reports intermittent internet disconnections every 2-3 hours. Connection drops last 5-10 minutes.",
      category: "Connectivity",
      severity: "Medium",
      resolvedDate: "2024-12-15T14:30:00Z",
      resolutionTime: "4.5 hours",
      customerCount: 12,
      embedding: [0.82, 0.45, 0.23, 0.67, 0.91], // Mock embedding vector
      rca: {
        rootCause: "Firmware bug in router model XR-2000 causing memory leak",
        identifiedBy: "Tech Team Lead - Sarah Johnson",
        identifiedDate: "2024-12-15T10:15:00Z",
        affectedModels: ["XR-2000", "XR-2001"],
        fixApplied: "Firmware update v2.4.1 deployed remotely",
        preventiveMeasures: [
          "Auto-update firmware enabled for all XR-2000 series",
          "Monitoring alerts configured for memory usage spikes",
          "Customer notification system activated for affected models"
        ]
      }
    },
    {
      ticketId: "TKT-2024-002156",
      shortDescription: "No dial tone on landline",
      longDescription: "Customer cannot make or receive calls. Phone displays 'No Service' message. Issue started after power outage.",
      category: "Voice Services",
      severity: "High",
      resolvedDate: "2024-12-18T09:20:00Z",
      resolutionTime: "2.1 hours",
      customerCount: 8,
      embedding: [0.15, 0.78, 0.44, 0.22, 0.33],
      rca: {
        rootCause: "Network switch power supply failure affecting POTS lines in zone 4B",
        identifiedBy: "Field Engineer - Marcus Chen",
        identifiedDate: "2024-12-18T08:00:00Z",
        affectedModels: ["Legacy POTS infrastructure"],
        fixApplied: "Replaced redundant power supply unit in network switch NS-440",
        preventiveMeasures: [
          "Scheduled quarterly power supply health checks",
          "Battery backup installation for critical switches",
          "Proactive component replacement for units over 5 years old"
        ]
      }
    },
    {
      ticketId: "TKT-2024-003421",
      shortDescription: "Slow internet speed during peak hours",
      longDescription: "Customer experiences significant speed reduction (from 100Mbps to 15Mbps) between 6PM-10PM daily. Speeds normal during other times.",
      category: "Connectivity",
      severity: "Low",
      resolvedDate: "2024-12-10T16:45:00Z",
      resolutionTime: "72 hours",
      customerCount: 45,
      embedding: [0.78, 0.52, 0.31, 0.69, 0.88],
      rca: {
        rootCause: "Network congestion due to oversubscription in residential area (Oakwood subdivision)",
        identifiedBy: "Network Planning - David Kumar",
        identifiedDate: "2024-12-08T11:30:00Z",
        affectedModels: ["N/A - Infrastructure capacity issue"],
        fixApplied: "Additional fiber trunk installed to increase backbone capacity by 40%",
        preventiveMeasures: [
          "Capacity monitoring dashboard deployed for high-density areas",
          "Proactive network expansion triggered when utilization exceeds 70%",
          "Customer communication protocol for planned upgrades"
        ]
      }
    },
    {
      ticketId: "TKT-2024-004567",
      shortDescription: "WiFi not working after router reset",
      longDescription: "Customer reset router to troubleshoot speed issues. After reset, WiFi network not visible. Ethernet connection works fine.",
      category: "Equipment",
      severity: "Medium",
      resolvedDate: "2024-12-19T11:10:00Z",
      resolutionTime: "1.5 hours",
      customerCount: 3,
      embedding: [0.71, 0.38, 0.55, 0.62, 0.84],
      rca: {
        rootCause: "Factory reset cleared custom WiFi configuration; auto-config service failed due to expired SSL certificate",
        identifiedBy: "Remote Tech Support - Lisa Park",
        identifiedDate: "2024-12-19T10:00:00Z",
        affectedModels: ["Router Model WF-5G-Pro"],
        fixApplied: "Manual WiFi reconfiguration via customer portal; SSL certificate renewed on auto-config server",
        preventiveMeasures: [
          "Certificate expiration monitoring system implemented",
          "Auto-renewal configured 30 days before expiration",
          "Backup configuration storage in customer profile"
        ]
      }
    },
    {
      ticketId: "TKT-2024-005892",
      shortDescription: "Intermittent connection drops",
      longDescription: "Customer reports WiFi connection dropping randomly 4-6 times per day. Each drop lasts 2-3 minutes. All devices affected simultaneously.",
      category: "Connectivity",
      severity: "Medium",
      resolvedDate: "2024-12-12T13:25:00Z",
      resolutionTime: "6 hours",
      customerCount: 7,
      embedding: [0.85, 0.48, 0.26, 0.71, 0.93],
      rca: {
        rootCause: "Radio frequency interference from neighboring channel overlap and baby monitor on 2.4GHz",
        identifiedBy: "Field Technician - Robert Martinez",
        identifiedDate: "2024-12-12T09:30:00Z",
        affectedModels: ["Router Model AC-1900"],
        fixApplied: "Changed WiFi channel from auto to fixed channel 11; upgraded router to dual-band model with automatic band steering",
        preventiveMeasures: [
          "WiFi spectrum analyzer tool deployed for field techs",
          "Customer education on device interference sources",
          "Default router settings optimized for high-density areas"
        ]
      }
    }
  ];

  // Simulate query embedding (in real implementation, use actual embedding model)
  const queryEmbedding = generateMockEmbedding(searchQuery);

  // Calculate similarity scores
  const scoredTickets = ticketDatabase.map(ticket => ({
    ...ticket,
    similarityScore: cosineSimilarity(queryEmbedding, ticket.embedding)
  }));

  // Sort by similarity and take top K
  const topResults = scoredTickets
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, topK)
    .map(ticket => {
      const { embedding, ...ticketWithoutEmbedding } = ticket;
      return ticketWithoutEmbedding;
    });

  return {
    searchQuery,
    totalResults: topResults.length,
    searchTimestamp: new Date().toISOString(),
    results: topResults
  };
}

// Helper: Generate mock embedding based on search query
function generateMockEmbedding(query) {
  const lowerQuery = query.toLowerCase();
  
  // Simulate semantic understanding with keyword-based mock embeddings
  if (lowerQuery.includes('internet') || lowerQuery.includes('connection') || lowerQuery.includes('disconnect')) {
    return [0.80, 0.47, 0.25, 0.68, 0.90]; // Similar to connectivity issues
  } else if (lowerQuery.includes('phone') || lowerQuery.includes('call') || lowerQuery.includes('dial')) {
    return [0.18, 0.75, 0.42, 0.25, 0.35]; // Similar to voice issues
  } else if (lowerQuery.includes('wifi') || lowerQuery.includes('wireless')) {
    return [0.74, 0.40, 0.50, 0.65, 0.86]; // Similar to WiFi issues
  } else if (lowerQuery.includes('slow') || lowerQuery.includes('speed')) {
    return [0.76, 0.50, 0.33, 0.70, 0.87]; // Similar to speed issues
  }
  
  // Default random-ish embedding for other queries
  return [0.50, 0.50, 0.50, 0.50, 0.50];
}

// Helper: Calculate cosine similarity between two vectors
function cosineSimilarity(vec1, vec2) {
  const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
  const mag1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
  const mag2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (mag1 * mag2);
}

module.exports = { searchSimilarTickets };