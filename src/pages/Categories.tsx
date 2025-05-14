import React, { useState } from 'react';
import './GamePlatform.css';

// Category images
import A1 from '../assets/a1.png';
import A2 from '../assets/a2.png';
import A3 from '../assets/a3.png';
import A4 from '../assets/a4.png';
import A5 from '../assets/a5.png';
import A6 from '../assets/a6.png';
import A7 from '../assets/a7.png';
import A8 from '../assets/a8.png';
import A9 from '../assets/a9.png';
import A10 from '../assets/a10.png';
import A11 from '../assets/a11.png';

interface CategoryProps {
  name: string;
  image: string;
  placeholder?: string;
}

const Categories: React.FC = () => {
  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories: CategoryProps[] = [
    { name: 'Card Games', image: A11, placeholder: 'Card Games' },
    { name: 'Trivia', image: A10, placeholder: 'Trivia' },
    { name: 'Word Games', image: A9, placeholder: 'Scrumble' },
    { name: 'Puzzles', image: A8 },
    { name: 'Adventure', image: A7 },
    { name: 'Shooting', image: A6 },
    { name: 'Sand Box', image: A5 },
    { name: 'Strategy', image: A4 },
    { name: 'Racing', image: A3 },
    { name: 'Simulation', image: A2 },
    { name: 'Arcade', image: A1 },
  ];

  // Filter categories based on search query
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="categories-sections">
      <h2>Categories</h2>
      {filteredCategories.length > 0 ? (
        <div className="categories-grids">
          {filteredCategories.map((category, index) => (
            <div key={index} className="category-cards">
              <img src={category.image} alt={category.name} className="category-images" />
              {category.placeholder && <div className="category-placeholders">{category.placeholder}</div>}
              <button className="category-buttons">{category.name.toUpperCase()}</button>
            </div>
          ))}
        </div>
      ) : (
        <p>No categories found matching your search.</p>
      )}
    </div>
  );
};

export default Categories;