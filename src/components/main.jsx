import {App} from './App.jsx'
import { h, render } from '/vendor/preact/preact.mjs';

const root = document.getElementById('app')
render(<App />, document.getElementById('app'));