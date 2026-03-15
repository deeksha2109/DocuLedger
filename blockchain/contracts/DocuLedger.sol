// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DocuLedger {

    struct Document {
        string docId;
        string owner;
        string title;
        string issuer;
        string hashValue;
        uint256 timestamp;
        bool verified;
    }

    mapping(string => Document) private documents;

    event DocumentAdded(string docId, string owner);
    event DocumentVerified(string docId);

    function addDocument(
        string memory _docId,
        string memory _owner,
        string memory _title,
        string memory _issuer,
        string memory _hashValue
    ) public {

        documents[_docId] = Document(
            _docId,
            _owner,
            _title,
            _issuer,
            _hashValue,
            block.timestamp,
            false
        );

        emit DocumentAdded(_docId, _owner);
    }

    function verifyDocument(string memory _docId) public {
        documents[_docId].verified = true;
        emit DocumentVerified(_docId);
    }

    function getDocument(string memory _docId)
        public
        view
        returns (
            string memory,
            string memory,
            string memory,
            string memory,
            string memory,
            uint256,
            bool
        )
    {
        Document memory d = documents[_docId];

        return (
            d.docId,
            d.owner,
            d.title,
            d.issuer,
            d.hashValue,
            d.timestamp,
            d.verified
        );
    }
}