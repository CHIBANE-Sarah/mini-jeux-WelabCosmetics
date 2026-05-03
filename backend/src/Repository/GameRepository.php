<?php

// Namespace du repository dans le projet Symfony.
namespace App\Repository;

// Entité gérée par ce repository.
use App\Entity\Game;

// Classe de base Doctrine pour les repositories Symfony.
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;

// ManagerRegistry donne accès à la configuration Doctrine.
use Doctrine\Persistence\ManagerRegistry;

// Repository associé à l'entité Game.
// Il permet d'effectuer des recherches en base sur les jeux.
class GameRepository extends ServiceEntityRepository
{
    // Constructeur appelé automatiquement par Symfony.
    public function __construct(ManagerRegistry $registry)
    {
        // Associe ce repository à l'entité Game.
        parent::__construct($registry, Game::class);
    }
}