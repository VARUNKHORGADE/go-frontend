import React from 'react';
import _cs from 'classnames';
import { connect } from 'react-redux';
import { IoMdArrowDropdown } from 'react-icons/io';

import {
  currentLanguageSelector,
  languageStringsSelector,
} from '#selectors';

import {
  setCurrentLanguageAction,
  getLanguageAction,
} from '#actions';

import languageContext from '#root/languageContext';
import DropdownMenu from '#components/dropdown-menu';
import Translate from '#components/Translate';

import styles from './styles.module.scss';

const languageOptions = {
  en: 'English',
  fr: 'French',
  es: 'Spanish',
  ar: 'Arabic',
};

function LanguageButton(p) {
  const {
    languageId,
    label,
    onClick,
    className,
    isActive,
  } = p;

  const handleClick = React.useCallback(() => {
    if (onClick) {
      onClick(languageId);
    }
  }, [onClick, languageId]);

  return (
    <button
      className={_cs(className, styles.languageButton, isActive && styles.active )}
      onClick={handleClick}
      type="button"
    >
      { label }
    </button>
  );
}

function LanguageSelect(p) {
  const { setStrings } = React.useContext(languageContext);

  const {
    getLanguage,
    currentLanguage,
    setCurrentLanguage,
    languageStrings,
  } = p;

  const languageRef = React.useRef(currentLanguage);

  React.useEffect(() => {
    getLanguage(languageRef.current);

    if (languageRef.current === 'ar') {
      document.body.style.direction = 'rtl';
      document.body.setAttribute('dir', 'rtl');
    } else {
      document.body.style.direction = 'ltr';
      document.body.setAttribute('dir', 'ltr');
    }
  }, [getLanguage]);

  React.useEffect(() => {
    setStrings(languageStrings);
  }, [languageStrings, setStrings]);

  const handleLanguageButtonClick = React.useCallback((languageId) => {
    setCurrentLanguage(languageId);

    // just to make sure the selected language is written in the preference
    setTimeout(() => {
      window.location.reload();
    }, 0);
  }, [setCurrentLanguage]);

  return (
    <DropdownMenu
      label={
        <div
          className={`${styles.dropdownMenuLabel} page__meta-nav-elements page__meta-nav-elements--lang`}
          title={languageOptions[currentLanguage]}
        >
          <Translate
            stringId="langSelectLabel"
            params={{ currentLanguage }}
          />
          <IoMdArrowDropdown />
        </div>
      }
      dropdownContainerClassName={styles.dropdown}
    >
      { Object.keys(languageOptions).map(l => (
        <LanguageButton
          isActive={currentLanguage === l}
          key={l}
          languageId={l}
          label={languageOptions[l]}
          onClick={handleLanguageButtonClick}
        />
      ))}
    </DropdownMenu>
  );
}

const mapStateToProps = (state) => ({
  currentLanguage: currentLanguageSelector(state),
  languageStrings: languageStringsSelector(state),
});

const mapDispatchToProps = (dispatch) => ({
  setCurrentLanguage: (...args) => dispatch(setCurrentLanguageAction(...args)),
  getLanguage: (...args) => dispatch(getLanguageAction(...args)),
});


export default connect(mapStateToProps, mapDispatchToProps)(LanguageSelect);
