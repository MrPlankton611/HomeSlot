import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, Router } from 'react-router-dom'
import axios from 'axios';
import './Schedule.css';

function Schedule(){
    return (
        <div className='navbar'>
            <button className='navbutton'>
            <Link to="/" class='navButtonText'>Home</Link>
            </button>
        </div>
    )
}

export default Schedule;
