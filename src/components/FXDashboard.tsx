import React, { useState, useEffect, useCallback } from 'react';
import { Select, Button, Row, Space } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import FXCard, { FXCardProps } from './FXcard';
import apiKey from '../constants/commonConstants';
import { useDispatch, useSelector } from 'react-redux';
import { addNewCard, fxCardListSelector, fxCardSortBySelector, fxCardSortOrderSelector, resetStoredCards, updateSorting } from '../store/fxCardListSlice';

const { Option } = Select;

const FXDashboard: React.FC = () => {
    const dispatch = useDispatch();
    const currencyCards = useSelector(fxCardListSelector);
    const sortField = useSelector(fxCardSortBySelector);
    const sortOrder = useSelector(fxCardSortOrderSelector);
    const [currencyOptions, setCurrencyOptions] = useState<string[]>([]);
    const [fromCurrency, setFromCurrency] = useState<string | undefined>(undefined);
    const [toCurrency, setToCurrency] = useState<string | undefined>(undefined);

    useEffect(() => {
        fetch(`https://api.freecurrencyapi.com/v1/currencies?apikey=${apiKey}`)
          .then(res => res.json())
          .then(data => {
            setCurrencyOptions(Object.keys(data?.data));
          });
        // Uncomment below line if you want to use static options instead
        // setCurrencyOptions(['USD', 'INR', 'GBP', 'EUR', 'CAD', 'JPY', 'CHF', 'AUD']);
    }, []);

    const handleFromCurrencyChange = (value: string) => {
        setFromCurrency(value);
        setToCurrency(undefined); // Reset the To currency when From changes
    };

    const handleToCurrencyChange = (value: string) => {
        setToCurrency(value);
    };

    const clearForm = () => {
        setFromCurrency('');
        setToCurrency('');
    }

    const deleteAllCardsHandler = () => {
        dispatch(resetStoredCards())
    }

    const addCurrencyCardHandler = async () => {
        try {
            const response = await fetch(`https://api.freecurrencyapi.com/v1/latest?apikey=${apiKey}&base_currency=${fromCurrency}&currencies=${toCurrency}`);
            const fxDetails = await response.json();
            
            const fxRate = fxDetails?.data?.[toCurrency || ''];
            if (fxRate === undefined) {
                return; // Early return if the fxRate is not found
            }
    
            const currentEpochTime = Date.now();
            dispatch(addNewCard({ 
                id: `${fromCurrency}_${toCurrency}`, 
                fromCurrency, 
                toCurrency, 
                fxRate, 
                createdTimestamp: currentEpochTime, 
                lastUpdatedTimestamp: currentEpochTime 
            }));
    
            clearForm();
        } catch (error) {
            console.error("Error fetching FX details:", error);
        }
    };
    

    const sortingDateHandler = (event: React.MouseEvent<HTMLDivElement>) => {
        const button = (event.target as HTMLButtonElement).closest('button');
        if (button) {
            const sortType = button.getAttribute('data-sorting');
            dispatch(updateSorting(sortType));
        }
    };

    const getButtonStyle = useCallback((buttonSortField: string) => ({
        backgroundColor: sortField === buttonSortField ? '#bfffbf' : 'transparent',
        border: sortField === buttonSortField ? '1px solid #1890ff' : '1px solid #d9d9d9',
    }), [sortField]);

    const getSortIcon = useCallback((buttonSortField: string) => {
        if (sortField !== buttonSortField) return <><ArrowUpOutlined /><ArrowDownOutlined /></>;
        return sortOrder ? <ArrowUpOutlined /> : <ArrowDownOutlined />;
    }, [sortField, sortOrder]);

    return (
        <>
            {/* Header Section */}
            <Space style={{ marginBottom: '20px', width: '100%' }} direction="vertical">
                <Space style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    position: 'fixed',
                    top: 0, 
                    zIndex: 1000, 
                    width: '100%',
                    backgroundColor: '#e6f7ff',
                    padding: '20px 50px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                }}>
                    <Space>
                        <Select
                            placeholder="From CURRENCY"
                            style={{ width: 200 }}
                            onChange={handleFromCurrencyChange}
                            value={fromCurrency}
                        >
                            {currencyOptions.map((currency) => (
                                <Option key={currency} value={currency}>{currency}</Option>
                            ))}
                        </Select>

                        <Select
                            placeholder="To CURRENCY"
                            style={{ width: 200 }}
                            onChange={handleToCurrencyChange}
                            value={toCurrency}
                            disabled={!fromCurrency} // Disable To currency selection if From is not selected
                        >
                            {currencyOptions.map((currency) => (
                                <Option key={currency} value={currency} disabled={currency === fromCurrency}>
                                    {currency}
                                </Option>
                            ))}
                        </Select>

                        <Button type="primary" onClick={addCurrencyCardHandler} disabled={!fromCurrency || !toCurrency}>ADD CARD</Button>
                    </Space>
                    <Space>
                        <Button danger onClick={deleteAllCardsHandler}>DELETE ALL CARDS</Button>
                    </Space>
                </Space>

                {/* Filter Chips Section */}
                <Space
                    style={{ marginTop: '70px', width: '100%', padding: '10px 50px' }}
                    onClick={sortingDateHandler} 
                >
                    <Button data-sorting="createdTimestamp" style={getButtonStyle('createdTimestamp')}>
                        SORT BY CREATED {getSortIcon('createdTimestamp')}
                    </Button>
                    <Button data-sorting="fxRate" style={getButtonStyle('fxRate')}>
                        SORT BY FX RATE {getSortIcon('fxRate')}
                    </Button>
                    <Button data-sorting="lastUpdatedTimestamp" style={getButtonStyle('lastUpdatedTimestamp')}>
                        SORT BY LAST UPDATED {getSortIcon('lastUpdatedTimestamp')}
                    </Button>
                </Space>
            </Space>

            {/* Cards Layout Section */}
            <Row gutter={[16, 16]} justify="start" style={{ padding: '10px 50px' }}>
                {currencyCards?.map((currencyCard: FXCardProps) => (<FXCard id={currencyCard.id} key={currencyCard.id} fromCurrency={currencyCard.fromCurrency} toCurrency={currencyCard.toCurrency} fxRate={currencyCard.fxRate} />))}
            </Row>
        </>
    );
};

export default FXDashboard;
