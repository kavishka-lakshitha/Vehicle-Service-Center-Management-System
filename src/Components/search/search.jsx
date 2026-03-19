import React from 'react';
import { IoIosSearch } from "react-icons/io";

const SearchBox = () => {
    return (
        <div className='searchBox'>
            <IoIosSearch className='icon' />
            <input type='text' placeholder='Search' />
        </div>
    );
}

export default SearchBox;
