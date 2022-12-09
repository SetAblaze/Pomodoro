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
      initPhrase: `Открой Помодоро`,
      getState
    });
  }
  return createAssistant({ getState });
};


function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [workMinutes, setWorkMinutes] = useState(45);
  const [breakMinutes, setBreakMinutes] = useState(15);
  const [appState, dispatch] = useReducer();

  const assistantRef = useRef(); 
  const assistant = useRef(typeof createAssistant);

  var state = {
    notes: [],
    };

    const getStateForAssistant = () => {
      console.log("getStateForAssistant: this.state:", state);
      const state_ = {
      item_selector: {
      items: state.notes.map(({ id, title }, index) => ({
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
        switch (action.type) {
          case "timerUp":
            console.log("timerUp")
            document.getElementById("playBtn").click();
            break;
          case "timerDown":
            console.log("timerDown")
            document.getElementById("pauseBtn").click();
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
