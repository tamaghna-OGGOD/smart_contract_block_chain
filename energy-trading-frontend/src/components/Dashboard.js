import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalTokens: 0,
        tokensForSale: 0,
        greenTokens: 0,
        sources: {}
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTokens = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/tokens');
                const tokens = response.data;

                // Calculate stats
                const tokensForSale = tokens.filter(token => token.forSale).length;
                const greenTokens = tokens.filter(token => token.certifiedGreen).length;

                // Count by source type
                const sources = tokens.reduce((acc, token) => {
                    acc[token.sourceType] = (acc[token.sourceType] || 0) + 1;
                    return acc;
                }, {});

                setStats({
                    totalTokens: tokens.length,
                    tokensForSale,
                    greenTokens,
                    sources
                });

                setLoading(false);
            } catch (err) {
                setError('Failed to fetch token data');
                setLoading(false);
            }
        };

        fetchTokens();
    }, []);

    if (loading) return <div className="text-center my-5"><h3>Loading dashboard...</h3></div>;

    if (error) return <Alert variant="danger">{error}</Alert>;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Energy Trading Dashboard</h1>
                <Link to="/create" className="btn btn-primary">Create New Token</Link>
            </div>

            <Row>
                <Col md={4}>
                    <Card className="mb-4 text-center">
                        <Card.Body>
                            <h2>{stats.totalTokens}</h2>
                            <p>Total Energy Tokens</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="mb-4 text-center">
                        <Card.Body>
                            <h2>{stats.tokensForSale}</h2>
                            <p>Tokens For Sale</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="mb-4 text-center">
                        <Card.Body>
                            <h2>{stats.greenTokens}</h2>
                            <p>Green Certified Tokens</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <h3 className="mb-3">Energy Sources</h3>
            <Row>
                {Object.entries(stats.sources).map(([source, count]) => (
                    <Col md={4} key={source}>
                        <Card className="mb-4 text-center token-card">
                            <Card.Body>
                                <div className={`source-icon ${source}`}>
                                    {getSourceIcon(source)}
                                </div>
                                <h3>{count}</h3>
                                <p>{capitalizeFirstLetter(source)} Energy Tokens</p>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <div className="text-center mt-4">
                <Link to="/tokens" className="btn btn-lg btn-success">View All Tokens</Link>
            </div>
        </div>
    );
};

// Helper function to get icon for energy source
function getSourceIcon(source) {
    switch (source) {
        case 'solar':
            return '☀️';
        case 'wind':
            return '🌬️';
        case 'hydro':
            return '💧';
        case 'biomass':
            return '🌱';
        case 'geothermal':
            return '🔥';
        default:
            return '⚡';
    }
}

// Helper function to capitalize
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export default Dashboard;