import { reactive, ref, nextTick } from 'vue';

export default function usePinInput({ onUnlock, onStep2, onSetupMaster }) {
  const setupP1 = reactive(['', '', '', '', '', '']);
  const setupP2 = reactive(['', '', '', '', '', '']);
  const unlockPasswordArray = reactive(['', '', '', '', '', '']);

  const setupP1Inputs = ref([]);
  const setupP2Inputs = ref([]);
  const unlockInputs = ref([]);

  const focusPinInput = (el) => {
    if (el && typeof el.focus === 'function') el.focus();
  };

  const onPinInput = (event, index, inputs, passwordArray, doneAction) => {
    const val = event.target.value.replace(/[^0-9]/g, '');
    passwordArray[index] = val;
    if (val && index < 5) {
      focusPinInput(inputs[index + 1]);
    } else if (passwordArray.join('').length === 6) {
      if (doneAction === 'unlock-done' && onUnlock) {
        onUnlock();
      } else if (doneAction === 'setup-p1-done' && onStep2) {
        onStep2();
      } else if (doneAction === 'setup-p2-done' && onSetupMaster) {
        onSetupMaster();
      }
    }
  };

  const onPinDelete = (event, index, inputs, passwordArray) => {
    if (!passwordArray[index] && index > 0) {
      passwordArray[index - 1] = '';
      focusPinInput(inputs[index - 1]);
    } else {
      passwordArray[index] = '';
    }
  };

  const resetPinInputs = (passwordArray, inputs) => {
    for (let i = 0; i < 6; i++) passwordArray[i] = '';
    nextTick(() => focusPinInput(inputs[0]));
  };

  return {
    setupP1,
    setupP2,
    unlockPasswordArray,
    setupP1Inputs,
    setupP2Inputs,
    unlockInputs,
    focusPinInput,
    onPinInput,
    onPinDelete,
    resetPinInputs
  };
}
