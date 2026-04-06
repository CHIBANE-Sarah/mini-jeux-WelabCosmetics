<?php

namespace App\Repository;

use App\Entity\Participation;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\ORM\NonUniqueResultException;
use Doctrine\ORM\NoResultException;

class ParticipationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Participation::class);
    }

    public function getAverageScore(): ?float
    {
        try {
            $result = $this->createQueryBuilder('p')
                ->select('AVG(p.score)')
                ->getQuery()
                ->getSingleScalarResult();

            return $result !== null ? (float) $result : null;
        } catch (NoResultException|NonUniqueResultException) {
            return null;
        }
    }

    public function getAverageDuration(): ?float
    {
        try {
            $result = $this->createQueryBuilder('p')
                ->select('AVG(p.dureeSeconds)')
                ->getQuery()
                ->getSingleScalarResult();

            return $result !== null ? (float) $result : null;
        } catch (NoResultException|NonUniqueResultException) {
            return null;
        }
    }
}
