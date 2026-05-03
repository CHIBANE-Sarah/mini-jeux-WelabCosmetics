<?php

// Namespace du repository dans le projet Symfony.
namespace App\Repository;

// Entité gérée par ce repository.
use App\Entity\Participation;

// Classe de base Doctrine pour les repositories Symfony.
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;

// ManagerRegistry permet d'accéder à la configuration Doctrine.
use Doctrine\Persistence\ManagerRegistry;

// Exceptions possibles lors de requêtes qui attendent un seul résultat.
use Doctrine\ORM\NonUniqueResultException;
use Doctrine\ORM\NoResultException;

class ParticipationRepository extends ServiceEntityRepository
{
    // Constructeur appelé automatiquement par Symfony.
    public function __construct(ManagerRegistry $registry)
    {
        // Associe ce repository à l'entité Participation.
        parent::__construct($registry, Participation::class);
    }

    // Calcule le score moyen de toutes les participations.
    public function getAverageScore(): ?float
    {
        try {
            // createQueryBuilder construit une requête Doctrine.
            // AVG(p.score) calcule la moyenne des scores.
            $result = $this->createQueryBuilder('p')
                ->select('AVG(p.score)')
                ->getQuery()
                ->getSingleScalarResult();

            // Convertit le résultat en float si une valeur existe.
            return $result !== null ? (float) $result : null;

        // Si aucun résultat ou un résultat inattendu est trouvé, on retourne null.
        } catch (NoResultException|NonUniqueResultException) {
            return null;
        }
    }

    // Calcule la durée moyenne des participations.
    public function getAverageDuration(): ?float
    {
        try {
            // AVG(p.dureeSeconds) calcule la durée moyenne en secondes.
            $result = $this->createQueryBuilder('p')
                ->select('AVG(p.dureeSeconds)')
                ->getQuery()
                ->getSingleScalarResult();

            // Convertit le résultat en float si une valeur existe.
            return $result !== null ? (float) $result : null;

        // Si la requête ne retourne rien ou retourne un résultat non unique, on retourne null.
        } catch (NoResultException|NonUniqueResultException) {
            return null;
        }
    }
}