import PaletteProvider from 'bpmn-js/lib/features/palette/PaletteProvider';

const removeUnsupportedBpmnFunctions = () => {
  console.log('MOIN!');
  const { getPaletteEntries } = PaletteProvider.prototype;
  // eslint-disable-next-line func-names
  PaletteProvider.prototype.getPaletteEntries = function () {
    const entries = getPaletteEntries.apply(this);
    delete entries['create.intermediate-event'];
    delete entries['create.subprocess-expanded'];
    delete entries['create.participant-expanded'];
    delete entries['create.group'];
    delete entries['create.exclusive-gateway'];
    delete entries['create.data-store'];
    delete entries['create.data-object'];
    return entries;
  };
  class CustomContextPadProvider {
    constructor(contextPad) {
      contextPad.registerProvider(this);
    }

    // eslint-disable-next-line class-methods-use-this
    getContextPadEntries() {
      // eslint-disable-next-line func-names
      return function (entries) {
        const customizesEntries = entries;
        delete customizesEntries['append.text-annotation'];
        delete customizesEntries['append.gateway'];
        delete customizesEntries['append.intermediate-event'];
        delete customizesEntries['lane-insert-above'];
        delete customizesEntries['lane-divide-two'];
        delete customizesEntries['lane-divide-three'];
        delete customizesEntries['lane-insert-below'];
        delete customizesEntries.replace;
        return customizesEntries;
      };
    }
  }

  CustomContextPadProvider.$inject = ['contextPad'];
  return CustomContextPadProvider;
};

export default removeUnsupportedBpmnFunctions;
