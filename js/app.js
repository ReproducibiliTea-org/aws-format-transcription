function get_json() {
  const parse_errors = document.getElementById('parse-errors');
  parse_errors.innerHTML = '';
  try{
    return JSON.parse(document.getElementById('transcript').value);
  } catch(e) {
    parse_errors.innerHTML = e;
    return null;
  }
}

function get_name_inputs() {
  return Array.from(
    document.getElementById('speakers').querySelectorAll('input')
  );
}

function process_transcript() {
  const json = get_json();
  if (!json) {
    return;
  }

  const names = extract_speaker_names(json.results.speaker_labels);
  update_names(names);
  format(json);
}

function extract_speaker_names(json) {
  const names = [];
  json.segments.forEach(segment => {
    if (!names.includes(segment.speaker_label)) {
      names.push(segment.speaker_label);
    }
  })
  return names;
}

function update_names(names) {
  const current_names = get_name_inputs().map(input => input.value);
  const h2 = document.createElement('h2');
  h2.innerHTML = '2. Speakers';

  const new_names = names.map((name, index) => current_names.at(index) ?? name);
  const names_element = document.getElementById('speakers');
  names_element.innerHTML = '';
  names_element.appendChild(h2);

  new_names.forEach((name, index) => {
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.value = name;
    input.id = names[index];
    input.innerHTML = name;
    input.onchange = () => update_name(input, input.value);
    const span = document.createElement('span');
    span.innerHTML = `Speaker ${index + 1}`;
    label.appendChild(span);
    label.appendChild(input);
    names_element.appendChild(label);
  })
}

function update_name(element, name) {
  element.value = name;
  format();
}

function format() {
  const json = get_json();
  const names = Object.fromEntries(
    get_name_inputs().map(input => [input.id, input.value])
  );

  const output = document.getElementById('output');
  output.innerHTML = '';

  const h2 = document.createElement('h2');
  h2.innerHTML = '3. Transcript';
  output.appendChild(h2);

  const by_speaker = []

  json.results.audio_segments.forEach(segment => {
    if (
      by_speaker.length > 0 &&
      segment.speaker_label === by_speaker.at(-1).speaker_label
    ) {
      by_speaker[by_speaker.length - 1].transcript += ` ${segment.transcript}`;
    } else {
      by_speaker.push({speaker_label: segment.speaker_label, transcript: segment.transcript});
    }
  })

  by_speaker.forEach(segment => {
    const speaker = document.createElement('div');
    speaker.classList.add('segment');
    const name = names[segment.speaker_label];
    speaker.innerHTML = `<p><span class="speaker-label">${name}:</span>${segment.transcript}</p>`;
    output.appendChild(speaker);
  })
}

document.getElementById('transcript').addEventListener('change', process_transcript);
