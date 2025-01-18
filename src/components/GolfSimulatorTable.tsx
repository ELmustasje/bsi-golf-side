import React, { useEffect, useState } from 'react';

interface Player {
  name: string;
  handicap: number;
}

interface Group {
  groupName: string;
  players: Player[];
}

const GolfSimulatorTable: React.FC = () => {
  const [groups, setGroups] = useState<Group[][]>([]);
  const [time, setTime] = useState([]);

  useEffect(() => {
    fetch('https://bsi-golf-api.vercel.app/groups')
      .then((response) => response.json())
      .then((data) => {
        if (data.groups) {
          setGroups(data.groups);
        } else {
          console.error('Unexpected response structure:', data);
        }
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  useEffect(() => {
    fetch('https://bsi-golf-api.vercel.app/get-date')
      .then((response) => response.json())
      .then((data) => {
        if (data.date) {
          setTime(data.date);
        } else {
          console.error('Unexpected response structure:', data);
        }
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  return (
    <div className="container mt-4">
      <h1 className="mb-4">BSI Golf</h1>
      <table className="table table-striped table-bordered table-hover">
        <thead>
          <tr>
            <th>Dato: {time}</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group, index) => (
            <tr key={index}>
              <td>Gruppe {index + 1}</td>
              <td>
                <ul>
                  {group.map((player, idx) => (
                    <li key={idx}>
                      {player[0]} {player[1]}
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GolfSimulatorTable;
