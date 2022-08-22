import { useState } from 'react';
import AntService from './Services/ant-service';
import AntCard from './Components/AntCard/AntCard';
import StatusIcon from './Components/StatusIcon/StatusIcon';

function App() {
  const [ants, setAnts] = useState<AntArray>([]);
  const [globalStatus, setGlobalStatus] = useState<string>("pre-race");
  let globalCompleteCount = 0;

  async function onLoadAnts() {
    const ants = await AntService.getAnts();
    ants.ants.forEach((ant: Ant) => {
      ant.status = "pre-race"
    });
    
    setGlobalStatus("pre-race");
    setAnts(ants.ants);
  }

  function onAntRace() {
    let newAnts = [...ants];

    for(let ant of newAnts){
      ant.status = "loading";
      ant.result = 0;
      let result = AntService.generateAntWinLikelihoodCalculator();
      result((likelihood: number) => processAntResultsWithName(likelihood, ant.name));
    }

    setGlobalStatus("loading");
    globalCompleteCount = 0;
    setAnts(newAnts);
  }

  function processAntResultsWithName(likelihood: number, name: string){ 
    let newAnts = [...ants];
    let antIndex = newAnts.findIndex((ant: any) => ant.name === name);
    newAnts[antIndex].result = likelihood;
    newAnts[antIndex].status = "complete";
   
    newAnts = newAnts.sort((a, b) => {
      if(!a.result) a.result = 0;
      if(!b.result) b.result = 0;

      return b.result - a.result;
    });

    globalCompleteCount++;
    if(globalCompleteCount === newAnts.length) setGlobalStatus("complete");

    setAnts(newAnts);
  }

  return (
    <div className="App my-0 mx-auto p-4 max-w-screen-lg">
      <button onClick={onLoadAnts} className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded disabled:opacity-50" disabled={globalStatus === "loading"}>{ants.length > 0 ? "Reset": "Load"} Ants</button>
      {ants.length > 0 && <button onClick={onAntRace} className="ml-1 bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded disabled:opacity-50" disabled={globalStatus === "loading"}>Race Ants</button>}
      <p className="float-right capitalize">{globalStatus} <span className="ml-1 mt-4">{<StatusIcon status={globalStatus}></StatusIcon>}</span></p>
      <div className="sm:grid-cols-2 lg:grid-cols-3 auto-rows-auto gap-3 grid">
        {ants && ants.map((ant: Ant) => <AntCard ant={ant} key={ant.name}></AntCard>)}
      </div>
    </div>
  );
}

export default App;
