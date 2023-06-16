import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import ReactCountryFlag from "react-country-flag";
import { UserContext } from '../UserProvider';
// import LanguageFlags from '../LanguageFlags';
import DropDown from '../DropDown';

function TranslateInput() {
  const key = process.env.REACT_APP_API_KEY;
  const [inputText, setInputText] = useState('');
  const [response, setResponse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { LangSelected, selectedOption, mappedArray, setMappedArray, setSelectedOption } = useContext(UserContext);

  const [responseFlags, setResponseFlags] = useState([]);
  const [error, setError] = useState(''); // input error, text limit
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  
    return () => { document.body.style.overflow = 'unset'; };
  }, [isModalOpen]);

  const handleInputChange = (event) => {
    const text = event.target.value;
    if (text.length > 326) {
        setError('SORRY （>﹏<） THE TEXT IS TOO LONG');
    } else {
        setError(null);   
    }
    setInputText(text);
};


  const handleTranslateClick = async () => {
    console.log("Translate button clicked");
    console.log('Selected option input:', selectedOption);
    if (mappedArray) {
      await translateText(inputText, selectedOption, mappedArray);
    } else {
      console.log('mappedArray is not defined yet');
    }
  };

  const countryFlags = LangSelected.map((country, index) => (
    <ReactCountryFlag
      key={index}
      className="emojiFlag"
      countryCode={country}
      style={{
        fontSize: '5em',
        lineHeight: '5em',
      }}
      svg
    />
  ));

  async function translateText(text, selectedOption, mappedArray) {
    try {
      console.log("translateText function invoked");
      console.log("mappedArray:", mappedArray);
  
       // For each language in mappedArray, perform a translation request
    const responses = await Promise.all(mappedArray.map(async (lang) => {
      // If selected language and current language are the same, return the text as is
      if (lang === selectedOption) {
        return text;
      }
        
        const options = {
          method: 'GET',
          url: 'https://translated-mymemory---translation-memory.p.rapidapi.com/get',
          params: {
            langpair: `${selectedOption}|${lang}`,
            q: text,
            mt: '1',
            onlyprivate: '0',
            de: 'a@b.c',
          },
          headers: {
            'X-RapidAPI-Key': key,
            'X-RapidAPI-Host': 'translated-mymemory---translation-memory.p.rapidapi.com',
          },
        };
        const response = await axios.request(options);
        console.log(`Translation Response for ${lang}:`, response.data); // log the full response data for each language
        const matches = response.data.matches;
        const translations = matches.map(match => match.translation.toLowerCase());
        const uniqueTranslations = new Set(translations);
        const finalTranslation = Array.from(uniqueTranslations).join(" / ");
  
        return finalTranslation;
      }));
  
      // Set the responses array as the response state
      setResponse(responses);
      setResponseFlags(mappedArray); // Use the original mappedArray
      setIsModalOpen(true);
    } catch (error) {
      console.error(error);
    }
    console.log("selectedOption",selectedOption.length)
    console.log("mappedArray:", mappedArray)
  }
  
  const languageToCountryCode = {
    'en': 'GB',
    'de': 'DE',
    'fr': 'FR',
    'pt': 'BR',
    'ru': 'RU',
    'it': 'IT',
    'es': 'ES',
    'tr': 'TR',
    'zh': 'CN',
    'ja': 'JP',
    // add more language to country code mappings if needed
  }
  const goBack = () => {
    window.history.back();
  }

  function Modal({ isOpen, onClose, children }) {
    if (!isOpen) {
      return null;
    }

    return (
      <div>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <div>
          {children.map((child, index) => {
            const countryCode = languageToCountryCode[responseFlags[index]];
            return (
              <TranslationBox key={index}>
                <RoundedFlagContainer>
                  <FlexContainer>
                    <ReactCountryFlag
                      className="emojiFlag"
                      countryCode={countryCode}
                      style={{ fontSize: '2em', lineHeight: '2em', marginRight: '1em' }}
                      svg
                    />
                    <TranslationText>
                      {child}
                    </TranslationText>
                  </FlexContainer>
                </RoundedFlagContainer>
              </TranslationBox>
            );
          })}
        </div>
        <RightAlignContainer>
          <CloseButton onClick={onClose}>Close</CloseButton>
        </RightAlignContainer>
      </div>
    );
  }
  

  return (
    <Container>
      <Container2>
        {countryFlags}
      </Container2>

      <Container3>
        <Container4>
          <p>from</p>
          <DropDown />
        </Container4>
        <ContainerButton>
          <GoBackButton onClick={goBack}>&lt;&lt;GoBack</GoBackButton>
        </ContainerButton>
       <Input type="text" maxLength="327" style={{ padding: 0, margin: 0 }} value={inputText} onChange={handleInputChange} placeholder={"What do you want to translate?"} />
      </Container3>

      <Button onClick={handleTranslateClick}>Translate</Button>
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {response !== null ? (
          response.map((translatedText, index) => (
            <div key={index}>{translatedText}</div>
          ))
        ) : (
          <div>No translations available.</div>
        )}
      </Modal>
    </Container>
  );
}

export default TranslateInput;

const Input = styled.input`
    width: 85vw;
    height: 8vh;
    margin-top: 5vh;
    text-align: center;
    border: none;
    border-bottom: 1px solid #000;
    font-size: 1.5rem;
    border-radius: 45px;
    &::placeholder { /* Chrome, Firefox, Opera, Safari 10.1+ */
        font-size: 1.5rem;
    }

    @media screen and (max-width: 600px) {
        &::placeholder {
            font-size: 1rem;
        }
    }
    
`
const Container = styled.div`                   
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    overflow: auto; // add this to enable scrolling within the container if necessary
`
const Container2 = styled.div`                   
display: flex;
flex-wrap: wrap;
gap: 5vw;
justify-content: center;
align-items: center;
margin-bottom: 20px;   // add some margin at the bottom
`
const Container3 = styled.div`                   
display: flex;
  flex-direction: column;  // align items in a column
  align-items: center;  // center items horizontally
  gap: 5vw;

`
const Container4 = styled.div`                   
display: flex;
flex-wrap: wrap;
gap: 5vw;
justify-content: center;
align-items: center;
`
const Button = styled.button`
    width: 140px;
    height: 45px;
    margin-top: 5px;
    font-family: 'Roboto', sans-serif;
    font-size: 18px;
    text-transform: uppercase;
    letter-spacing: 2.5px;
    font-weight: 500;
    color: #000;
    background-color: #b0afaf;
    border: none;
    border-radius: 45px;
    box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease 0s;
    cursor: pointer;
    outline: none;
    }
  
  &:hover {
    background-color: #2EE59D;
    box-shadow: 0px 15px 20px rgba(46, 229, 157, 0.4);
    color: #fff;
    transform: translateY(-7px);
  }

`
const RightAlignContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`

const TranslationBox = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid black;
  margin: 1em 0;
  padding: 1em;
`
const CloseButton = styled.button`
border-radius: 45px;
  background-color: #f4f4f4;
  border: 1px solid #333;
  color: #333;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 1em;
  margin-top: 1em;
  margin-right: 1em;
  transition: all 0.3s ease 0s;

  &:hover {
    background-color: #2EE59D;
    box-shadow: 0px 15px 20px rgba(46, 229, 157, 0.4);
  }
`

const RoundedFlagContainer = styled.div`
  display: inline-block;
  overflow: hidden;
 
`
const FlexContainer = styled.div`
    display: flex;
    align-items: center; /* align vertical */
`;

const TranslationText = styled.div`
    /* additional styles */
    word-break: break-word; /* to prevent overflow by breaking the word */
`;
const ErrorMessage = styled.div`
    color: yellow;
    margin-left: 2em
`
const Modal = styled.div`
  position: fixed; // make it fixed
  top: 0; // stretch from the very top
  left: 0; // stretch from the very left
  width: 100%; // take up full width
  height: 100%; // take up full height
  overflow-y: auto; // make it vertically scrollable
  // Add any other styles as needed.
`;
const GoBackButton = styled.button`
  justify-self: start;
  border-radius: 45px;
  transition: all 0.3s ease 0s;

  &:hover {
    background-color: #2EE59D;
    box-shadow: 0px 15px 20px rgba(46, 229, 157, 0.4);
    color: #f4f4f4;
  }
`;
const ContainerButton = styled.div`                   
display: flex;
justify-content: flex-start;
width: 100%;
margin-left: 5em;

`