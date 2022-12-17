import React, {
  FC,
  memo,
  useState,
  useReducer,
  useRef,
  useEffect
} from "react";
import './App.css';
import Timer from "./Timer";
import Settings from "./Settings";
import SettingsContext from "./SettingsContext";

import {
  createSmartappDebugger,
  createAssistant,
  AssistantAppState, 
} from "@sberdevices/assistant-client";


const initAssistant = (getState) => {
  if (process.env.NODE_ENV === "development") {
    return createSmartappDebugger({
      token: process.env.REACT_APP_TOKEN ?? "",
      initPhrase: `Запусти ${process.env.REACT_APP_SMARTAPP}`,
      getState,
    });
  }
  return createAssistant({ getState });
};

const timePeriod = [
  {MinStr: "один", MinNum: "1"},
  {MinStr: "одну", MinNum: "1"},
  {MinStr: "две", MinNum: "2"},
  {MinStr: "два", MinNum: "2"},
  {MinStr: "три", MinNum: "3"},
  {MinStr: "пять", MinNum: "5"},
  {MinStr: "восемь", MinNum: "8"},
  {MinStr: "десять", MinNum: "10"},
  {MinStr: "пятнадцать", MinNum: "15"},
  {MinStr: 'двадцать', MinNum: "20"},
  {MinStr: "двадцать пять", MinNum: "25"},
  {MinStr: "тридцать", MinNum: "30"},
  {MinStr: "тридцать пять", MinNum: "35"},
  {MinStr: "сорок", MinNum: "40"},
  {MinStr: "сорок пять", MinNum: "45"},
  {MinStr: "пятьдесят", MinNum: "50"},
  {MinStr: "час", MinNum: "60"},
  {MinStr: "один час", MinNum: "60"},
  {MinStr: "два часа", MinNum: "120"},
  {MinStr: "2 часа", MinNum: "120"},
]

function whatTime(responseActionStr) {
  let requestedTime = undefined;

  for(let i = 0; i < timePeriod.length; i++){
    if(responseActionStr.indexOf(timePeriod[i].MinStr) !== -1 || responseActionStr.indexOf(timePeriod[i].MinNum) !== -1) {
      requestedTime = parseInt(timePeriod[i].MinNum);
    }
  }

  if(requestedTime !== undefined) {return requestedTime;}
}

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [workMinutes, setWorkMinutes] = useState(45);
  const [breakMinutes, setBreakMinutes] = useState(15);
  const [appState, dispatch] = useReducer();

  const assistantRef = useRef(); 
  const assistant = useRef(typeof createAssistant);

  var state = {
    minutes: [],
    };

    const getStateForAssistant = () => {
      console.log("getStateForAssistant: this.state:", state);
      const state_ = {
      item_selector: {
      items: state.minutes.map(({ id, title }, index) => ({
      number: index + 1,
      id,
      title,
      })),
      },
      };
      console.log("getStateForAssistant: state:", state);
      return state_;
    };

    useEffect(() => {
      assistant.current = initAssistant(() => getStateForAssistant());
      assistant.current.on("start", (event) => {
      console.log(`assistant.on(start)`, event);
      });
      assistant.current.on("data", (event /*: any*/) => {
        if (event.type == "smart_app_data") {
          console.log(event);
          if (event.sub != undefined) {
            console.log("Sub", event.sub);
            
          } else if (event.user_id != undefined) {
            console.log("UserId", event.user_id);
          }
        }
        console.log(`assistant.on(data)`, event);
        const { action } = event;

        dispatchAssistantAction(action);
        
  });
    },
    []);


    const dispatchAssistantAction = async (action) => {
      console.log("dispatchAssistantAction", action);
      if (action) {
        let workTime = 45;
        let breakTime = 15;
        console.log(action.minutes);
        switch (action.type) {
          case "timerUp":
            console.log("timerUp")
            document.getElementById("playBtn").click();
            break;
          case "timerDown":
            console.log("timerDown")
            document.getElementById("pauseBtn").click();
            break;
          case "openSettings":
            console.log("openSettings")
            setShowSettings(true);
            break;
          case "closeSettings":
            console.log("closeSettings")
            setShowSettings(false);
            break;
          case "setSessionTime":
            workTime = whatTime(action.minutes);
            console.log("setSessionTime")
            setWorkMinutes(workTime);
            break;
          case "setBreakTime":
            breakTime = whatTime(action.minutes);
            console.log("setBreakTime")
            setBreakMinutes(breakTime);
            break;
          default:
            break;
          }
        }
      };

  return (
    <main>
      <SettingsContext.Provider value={{
        showSettings,
        setShowSettings,
        workMinutes,
        breakMinutes,
        setWorkMinutes,
        setBreakMinutes,
      }}>
        {showSettings ? <Settings /> : <Timer />}
      </SettingsContext.Provider>
    </main>
  );
}


export default App;
