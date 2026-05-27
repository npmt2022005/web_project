package com.thuc_kien.freelance_marketplace.Repository;

import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

import com.thuc_kien.freelance_marketplace.Entity.GigDoc;

@Repository
public interface GigElasticRepository extends ElasticsearchRepository<GigDoc, String> {
    

}
