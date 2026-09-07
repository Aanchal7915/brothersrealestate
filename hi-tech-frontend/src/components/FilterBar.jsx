import { useContext } from 'react';
import { Filter } from 'lucide-react';
import { PropertyContext } from '../context/PropertyContext';

const FilterBar = () => {
  const { filters, setFilters } = useContext(PropertyContext);

  const containerStyle = {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '1rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    marginBottom: '1.5rem',
    animation: 'slideInDown 0.5s ease-out',
    border: '1px solid #e5e7eb'
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1rem'
  };

  const titleStyle = {
    fontWeight: 600,
    fontSize: '1.125rem',
    color: '#111827',
    marginLeft: '0.5rem'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem'
  };

  const inputBaseStyle = {
    width: '100%',
    padding: '0.875rem 1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '0.75rem',
    fontSize: '0.95rem',
    transition: 'all 0.3s ease',
    background: '#f9fafb',
    fontFamily: 'inherit'
  };

  const inputFocusStyle = {
    borderColor: '#2563eb',
    background: 'white',
    boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)',
    outline: 'none'
  };

  const selectStyle = {
    ...inputBaseStyle,
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 0.75rem center',
    backgroundSize: '1.25rem',
    paddingRight: '3rem'
  };

  const handleInputFocus = (e) => {
    Object.assign(e.target.style, inputFocusStyle);
  };

  const handleInputBlur = (e) => {
    e.target.style.borderColor = '#e5e7eb';
    e.target.style.background = '#f9fafb';
    e.target.style.boxShadow = 'none';
  };

  return (
    <>
      <style>{`
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      
      <div style={containerStyle}>
        <div style={headerStyle}>
          <Filter style={{ width: '1.25rem', height: '1.25rem', color: '#2563eb' }} />
          <h3 style={titleStyle}>Filters</h3>
        </div>
        
        <div style={gridStyle}>
          <input
            type="text"
            placeholder="City"
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            style={inputBaseStyle}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
          
          <input
            type="number"
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            style={inputBaseStyle}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
          
          <input
            type="number"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            style={inputBaseStyle}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
          
          <select
            value={filters.bhk}
            onChange={(e) => setFilters({ ...filters, bhk: e.target.value })}
            style={selectStyle}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          >
            <option value="">All BHK</option>
            <option value="1">1 BHK</option>
            <option value="2">2 BHK</option>
            <option value="3">3 BHK</option>
            <option value="4">4 BHK</option>
          </select>
        </div>
      </div>
    </>
  );
};

export default FilterBar;