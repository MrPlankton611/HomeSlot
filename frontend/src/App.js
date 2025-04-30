import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, Router } from 'react-router-dom'
import Schedule from './pages/Schedule'
import axios from 'axios';
import './App.css';

function App() {
  const [name, setName] = useState('John');
  const [startTime, setStartTime] = useState('00:00');
  const [endTime, setEndTime] = useState('00:00');
  const [appliance, setAppliance] = useState('Computer');
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/schedule")
      .then(res => {
        setSchedule(res.data);
        console.log(res.data);
      });
  }, []);

  const reserve = () => {
    const reservation = { 
      name, 
      startTime, 
      endTime, 
      appliance 
    };
    axios.post("http://localhost:5000/api/reserve", reservation)
      .then(res => {
        const savedReservation = {
          ...reservation,
          success: res.data.message
        };
        setSchedule(prev => [...prev, savedReservation]);
      });
  };

  return (
    
    <BrowserRouter>
        <Routes>
          <Route path="/Schedule" element={<Schedule />} />
        </Routes>
    <Routes>
    <Route path="/" element={
      <div className='container'>
        <div className='navbar'>
          <button className='navbutton'>
            <Link to="/Schedule" class='navButtonText'>Schedule</Link>
          </button>
        </div>
        <div className="setScheduleContainer">
        <h1>Shared Appliance Scheduler</h1>
        <input value={appliance} onChange={e => setAppliance(e.target.value)} placeholder="Appliance" />
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" />
          <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
          <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
          <button onClick={reserve}>Reserve</button>
          <button onClick={() => setSchedule(prev => prev.slice(0, -1))}>
          Remove Last Reservation
          </button>

          <ul>
            {schedule.map((entry, i) => (
              <li key={i}>
                <strong>{entry.name}</strong> reserved <strong>{entry.appliance} </strong> 
                from <strong>{entry.startTime}</strong> to <strong>{entry.endTime}</strong> 
                — Status: <em>{entry.success}</em>
              </li>
            ))}
          </ul>
        </div>
    </div>
      } />
    </Routes>
    
    </BrowserRouter>
    
    
  );
}

export default App;
