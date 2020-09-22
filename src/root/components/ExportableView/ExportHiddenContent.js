import React from 'react';
import _cs from 'classnames';

import exportContext from './exportContext';
import styles from './styles.module.scss';

const stylesToModeMap = {
  display: styles.display,
  visibility: styles.visibility,
};


function ExportHiddenContent(p) {
  const {
    className, 
    children,
    mode='display', // display or visibility
  } = p;

  const {
    isExporting,
    isPreviewMode,
  } = React.useContext(exportContext);

  return (
    <div className={_cs(
        className,
        stylesToModeMap[mode],
        styles.exportHidden,
        isExporting && styles.exporting,
        isPreviewMode && styles.preview,
      )}
    >
      { children }
    </div>
  );
}

export default ExportHiddenContent;
