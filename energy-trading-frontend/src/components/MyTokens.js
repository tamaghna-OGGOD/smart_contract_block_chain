import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button, Form, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const MyTokens = () => {
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [owner, setOwner] = useState('user3'); // Default user

    useEffect(() => {
        if (owner) {
            fetchUserTokens();
        }
    }, [owner]);

    const fetchUserTokens = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`http://localhost:3000/api/tokens/owner/${owner}`);
            setTokens(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch tokens for this user');
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>My Energy Tokens</h1>
                <Link to="/create">
                    <Button variant="primary">Create New Token</Button>
                </Link>
            </div>

            <Card className="mb-4">
                <Card.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>View Tokens for User:</Form.Label>
                            <div className="d-flex">
                                <Form.Control
                                    type="text"
                                    value={owner}
                                    onChange={(e) => setOwner(e.target.value)}
                                    placeholder="Enter user ID"
                                />
                                <Button
                                    variant="outline-primary"
                                    onClick={fetchUserTokens}
                                    className="ms-2"
                                >
                                    Load
                                </Button>
                            </div>
                        </Form.Group>
                    </Form>
                </Card.Body>
            </Card>

            {error && <Alert variant="danger">{error}</Alert>}

            {loading ? (
                <div className="text-center my-5"><h3>Loading tokens...</h3></div>
            ) : (
                <>
                    {tokens.length > 0 ? (
                        <Row>
                            {tokens.map(token => (
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
                                                    <Button variant="outline-primary">Manage</Button>
                                                </Link>
                                            </div>
                                        </Card.Body>
                                        <Card.Footer className="text-muted">
                                            Created: {new Date(token.createdAt).toLocaleDateString()}
                                        </Card.Footer>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    ) : (
                        <div className="text-center p-5 bg-light rounded">
                            <h4>No tokens found</h4>
                            <p>This user doesn't own any energy tokens yet.</p>
                            <Link to="/create">
                                <Button variant="primary">Create a Token</Button>
                            </Link>
                        </div>
                    )}
                </>
            )}
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

export default MyTokens;