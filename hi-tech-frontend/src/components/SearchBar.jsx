import { useState } from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  const formStyle = {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '1.5rem',
    animation: 'slideInDown 0.5s ease-out'
  };

  const inputWrapperStyle = {
    flex: 1,
    position: 'relative'
  };

  const iconStyle = {
    position: 'absolute',
    left: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af',
    width: '1.25rem',
    height: '1.25rem',
    pointerEvents: 'none',
    transition: 'color 0.3s ease'
  };

  const inputStyle = {
    width: '100%',
    paddingLeft: '3rem',
    paddingRight: '1.25rem',
    paddingTop: '0.875rem',
    paddingBottom: '0.875rem',
    border: '2px solid #e5e7eb',
    borderRadius: '0.75rem',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    background: '#f9fafb',
    fontFamily: 'inherit'
  };

  const inputFocusStyle = {
    borderColor: '#2563eb',
    background: 'white',
    boxShadow: '0 0 0 4px rgba(37, 99, 235, 0.1)',
    outline: 'none',
    transform: 'scale(1.01)'
  };

  const buttonStyle = {
    padding: '0.875rem 2rem',
    background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '0.75rem',
    fontWeight: 600,
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
    whiteSpace: 'nowrap'
  };

  const buttonHoverStyle = {
    transform: 'translateY(-3px)',
    boxShadow: '0 8px 20px rgba(220, 38, 38, 0.4)'
  };

  return (
    <>
      <style>{`
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 640px) {
          .search-form {
            flex-direction: column;
          }
          .search-button {
            width: 100%;
          }
        }
      `}</style>
      
      <form onSubmit={handleSubmit} style={formStyle} className="search-form">
        <div style={inputWrapperStyle}>
          <Search 
            style={iconStyle} 
            id="search-icon"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by city, title, or location..."
            style={inputStyle}
            onFocus={(e) => {
              Object.assign(e.target.style, inputFocusStyle);
              const icon = document.getElementById('search-icon');
              if (icon) icon.style.color = '#2563eb';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.background = '#f9fafb';
              e.target.style.boxShadow = 'none';
              e.target.style.transform = 'scale(1)';
              const icon = document.getElementById('search-icon');
              if (icon) icon.style.color = '#9ca3af';
            }}
          />
        </div>
        
        <button 
          type="submit" 
          style={buttonStyle}
          className="search-button"
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = buttonHoverStyle.transform;
            e.currentTarget.style.boxShadow = buttonHoverStyle.boxShadow;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.3)';
          }}
        >
          Search
        </button>
      </form>
    </>
  );
};

export default SearchBar;