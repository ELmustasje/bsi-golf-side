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
  const [isFetching, setIsFetching] = useState<boolean>(true);


  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch("https://bsi-golf-api.vercel.app/groups");
        const data = await response.json();

        if (data.groups && data.groups.length > 0) {
          setGroups(data.groups);
          setIsFetching(false); // Stop fetching if groups are found
        } else {
          console.warn("Groups are empty. Retrying...");
          setTimeout(fetchGroups, 500); // Retry after 3 seconds
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setTimeout(fetchGroups, 500); // Retry after 3 seconds on error
      }
    };
    fetchGroups();

    // Clean up function to stop polling when the component unmounts
    return () => setIsFetching(false);
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
                      {player}
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
