import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { Newspaper, ExternalLink, Calendar, Clock } from 'lucide-react';

const Home = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data } = await api.get('/api/news/health');
        setNews(data);
      } catch (err) {
        console.error('Failed to fetch news', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  return (
    <div className="page-container">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Health News & Insights</h1>
            <p>Stay updated with the latest headlines in healthcare and wellness.</p>
          </div>
        </div>

        {loading ? (
          <div className="loading-container"><div className="spinner" /></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
            {news.length === 0 ? (
              <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem' }}>
                <Newspaper size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                <h3>No Recent News</h3>
                <p style={{ color: 'var(--text-muted)' }}>Check back later for updates or verify your API key.</p>
              </div>
            ) : (
              news.map((article, i) => (
                <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                  {article.urlToImage ? (
                    <img 
                      src={article.urlToImage} 
                      alt={article.title} 
                      style={{ width: '100%', height: '200px', objectFit: 'cover' }} 
                    />
                  ) : (
                    <div style={{ width: '100%', height: '200px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Newspaper size={48} color="var(--text-muted)" />
                    </div>
                  )}
                  <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{article.source.name}</span>
                      <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={12} />
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', lineHeight: 1.4 }}>{article.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', flex: 1, marginBottom: '1.5rem' }}>
                      {article.description?.substring(0, 120)}...
                    </p>
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                      Read Article <ExternalLink size={16} />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
