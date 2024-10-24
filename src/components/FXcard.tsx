import React, { useState } from 'react';
import { Card, Space, Typography, Input, Button, Col } from 'antd';
import { SyncOutlined, CloseOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { removeCard, reverseCardDetails, updateCardDetails } from '../store/fxCardListSlice';
import apiKey from '../constants/commonConstants';

const { Text } = Typography;

export interface FXCardProps {
  id: string;
  fromCurrency: string | undefined;
  toCurrency: string | undefined;
  fxRate: number;
}

const FXCard: React.FC<FXCardProps> = ({ id, fromCurrency, toCurrency, fxRate }) => {
  const dispatch = useDispatch();
  const [inputValue, setInputValue] = useState<number>(1);
  const [convertedValue, setConvertedValue] = useState<number>(fxRate);

  const handleConversion = () => {
    const convertedAmount = inputValue * fxRate;
    setConvertedValue(convertedAmount);
  };

  const handleRefresh = async () => {
    try {
      const response = await fetch(`https://api.freecurrencyapi.com/v1/latest?apikey=${apiKey}&base_currency=${fromCurrency}&currencies=${toCurrency}`);
      const fxDetails = await response.json();

      // Ensure fxDetails.data and the property corresponding to toCurrency exist
      const updatedFxRate = fxDetails?.data?.[toCurrency || ''];
      if (updatedFxRate === undefined) {
        console.error("FX rate not found");
        return; // Early return if the fxRate is not found
      }

      dispatch(updateCardDetails({ id: `${fromCurrency}_${toCurrency}`, fxRate: updatedFxRate }));
      setInputValue(1);
      setConvertedValue(updatedFxRate);
    } catch (error) {
      console.error("Error fetching FX details:", error);
    }
  };

  const handleDeletion = () => {
     dispatch(removeCard(id));
  }

  const handleReversalOfCard = () => {
    const newRate = (1/fxRate);
    dispatch(reverseCardDetails(id));
    setConvertedValue(newRate);
  }

  return (
    <Col span={6}>
        <Card
      title={
        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
          <Space style={{height: '60px'}}>
            <Text strong style={{ color: 'green' }}>{fromCurrency}</Text>
            <div className="swap-arrow"><Text style={{position: 'absolute',top: '-15px', left: '15px'}}>{fxRate.toFixed(2)}</Text></div>
            <Text strong style={{ color: 'green' }} onClick={handleReversalOfCard}>{toCurrency}</Text>
          </Space>
          <Space>
            <SyncOutlined style={{ cursor: 'pointer', fontSize: '16px' }} onClick={handleRefresh}/>
            <CloseOutlined style={{ cursor: 'pointer', fontSize: '16px', color: 'red' }} onClick={handleDeletion}/>
          </Space>
        </Space>
      }
      hoverable
      style={{ border: '1px solid #e6e6e6', borderRadius: '8px' }}
    >
      <Space style={{ width: '100%', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
        <div style={{ marginBottom: '8px' }}>
          <Text style={{ marginRight: '8px', fontWeight: 'bold' }}>{fromCurrency}:</Text>
          <Input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(Number(e.target.value))}
            style={{ width: '100px', textAlign: 'center', backgroundColor: '#e0ffe0' }}
          />
        </div>
        <div>
          <Text style={{ marginRight: '8px', fontWeight: 'bold' }}>{toCurrency}:</Text>
          <Input
            type="number"
            value={convertedValue.toFixed(2)}
            style={{ width: '100px', textAlign: 'center', backgroundColor: '#e0ffe0' }}
            readOnly
          />
        </div>
        </div>
        <Button type="primary" onClick={handleConversion} style={{ marginTop: '8px' }}>
          Convert
        </Button>
      </Space>
    </Card>
    </Col>
  );
};

export default FXCard;
