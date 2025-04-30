import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, Router } from 'react-router-dom'
import axios from 'axios';
import './Schedule.css';
import Timeline from 'react-calendar-timeline'
import 'react-calendar-timeline/style.css';
import moment from 'moment'

function Schedule(){
const [groups, setGroups] = useState([]);
const [items, setItems] = useState([]);
const baseDate = moment().startOf('day');
const [schedule, setSchedule] = useState([])

useEffect(() => {
  axios.get("http://localhost:5000/api/schedule")
    .then(res => {
      setSchedule(res.data);
    });
}, []);


useEffect(() => {
  const newGroups = [];
  const newItems = [];

  for (let i = 0; i < schedule.length; i++) {
    const entry = schedule[i];
    if (entry && entry.appliance != null) {
      newGroups.push({ id: i + 1, title: entry.appliance });
      newItems.push({
        id: i + 1,
        group: i + 1,
        title: entry.name,
        start_time: moment(`${baseDate.format('YYYY-MM-DD')}T${entry.startTime}`),
        end_time: moment(`${baseDate.format('YYYY-MM-DD')}T${entry.endTime}`)
      });
    }
  }

  setGroups(newGroups);
  setItems(newItems);
}, [schedule]);

    return (
        <div className='container'>
            <div className='navbar'>
                <button className='navbutton'>
                <Link to="/" className='navButtonText'>Home</Link>
                </button>
            </div>
            <div>
            <Timeline
                groups={groups}
                items={items}
                defaultTimeStart={baseDate.clone().hour(0)}
                defaultTimeEnd={baseDate.clone().hour(24)}
                onTimeChange={(visibleTimeStart, visibleTimeEnd, updateScrollCanvas) => {
                const minTime = baseDate.clone().startOf('day').valueOf();
                const maxTime = baseDate.clone().endOf('day').valueOf();

                if (visibleTimeStart < minTime && visibleTimeEnd > maxTime) {
                    updateScrollCanvas(minTime, maxTime);
                } else if (visibleTimeStart < minTime) {
                    updateScrollCanvas(minTime, minTime + (visibleTimeEnd - visibleTimeStart));
                } else if (visibleTimeEnd > maxTime) {
                    updateScrollCanvas(maxTime - (visibleTimeEnd - visibleTimeStart), maxTime);
                } else {
                    updateScrollCanvas(visibleTimeStart, visibleTimeEnd);
                }
            }}
            />

            </div>,
        </div>
       
    )
}



export default Schedule;
