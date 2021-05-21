import React, { useEffect } from 'react';
import axios from 'axios';

function Groups() {
    
    useEffect(() => {
        await axios.get('/hello');
    });
    
    return (
        <div className="container">Groups...</div>
    )
}

export default Groups;
