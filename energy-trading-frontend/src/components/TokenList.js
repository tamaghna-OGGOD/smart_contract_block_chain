import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const TokenList = () => {
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // all, forSale, green

    useEffect(() => {
        const fetchTokens = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/tokens');
                setTokens(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch tokens');
                setLoading(false);
            }
        };

        fetchTokens();
    }, []);

    const filteredTokens = tokens.filter(token => {
        if (filter === 'all') return true;
        if (filter === 'forSale') return token.forSale;
        if (filter === 'green') return token.certifiedGreen;
        return true;
    });

    if (loading) return <div className="text-center my-5"><h3>Loading tokens...</h3></div>;

    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Energy Tokens</h1>
                <div>
                    <Button
                        variant={filter === 'all' ? 'primary' : 'outline-primary'}
                        onClick={() => setFilter('all')}
                        className="me-2"
                    >
                        All
                    </Button>
                    <Button
                        variant={filter === 'forSale' ? 'primary' : 'outline-primary'}
                        onClick={() => setFilter('forSale')}
                        className="me-2"
                    >
                        For Sale
                    </Button>
                    <Button
                        variant={filter === 'green' ? 'primary' : 'outline-primary'}
                        onClick={() => setFilter('green')}
                    >
                        Green Certified
                    </Button>
                </div>
            </div>

            <Row>
                {filteredTokens.map(token => (
                    <Col md={4} key={token.id} className="mb-4">
                        <Card className="h-100 token-card">
                            {token.forSale && (
                                <Badge bg="success" className="card-badge">For Sale</Badge>
                            )}
                            <Card.Body>
                                <div className="text-center mb-3">
                                    <span className={`source-icon ${token.sourceType}`}>
                                        {getSourceIcon(token.sourceType)}
                                    </span>
                                </div>
                                <Card.Title>Token {token.id}</Card.Title>
                                <Card.Text>
                                    <strong>Owner:</strong> {token.owner}<br />
                                    <strong>Producer:</strong> {token.producer}<br />
                                    <strong>Energy:</strong> {token.energyAmount} kWh<br />
                                    <strong>Price:</strong> ${token.price}<br />
                                    <strong>Source:</strong> {capitalizeFirstLetter(token.sourceType)}<br />
                                </Card.Text>
                                <div className="d-flex justify-content-between align-items-center">
                                    {token.certifiedGreen && (
                                        <Badge bg="info">Green Certified</Badge>
                                    )}
                                    <Link to={`/tokens/${token.id}`}>
                                        <Button variant="outline-primary">Details</Button>
                                    </Link>
                                </div>
                            </Card.Body>
                            <Card.Footer className="text-muted">
                                Created: {new Date(token.createdAt).toLocaleDateString()}
                            </Card.Footer>
                        </Card>
                    </Col>
                ))}

                {filteredTokens.length === 0 && (
                    <Col>
                        <div className="text-center p-5 bg-light rounded">
                            <h4>No tokens found</h4>
                            <p>There are no tokens matching your current filter.</p>
                        </div>
                    </Col>
                )}
            </Row>
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

export default TokenList;